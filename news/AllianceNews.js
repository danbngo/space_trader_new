class AllianceNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Alliance formed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Alliance dissolved between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            ``,
            `Tensions between ${coloredName(planet)} and ${coloredName(targetPlanet)} prevent alliance formation!`,
            NT.ALLIANCE, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.ALLY,
                territory: CL.HIGH,
                marketCargoAmounts: CL.SLIGHTLY_HIGH,
                guildNumOfficers: CL.HIGH,
                security: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                officerQuality: CL.SLIGHTLY_HIGH,
                shipQuality: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.ALLY,
                territory: CL.HIGH,
                marketCargoAmounts: CL.SLIGHTLY_HIGH,
                guildNumOfficers: CL.HIGH,
                security: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                officerQuality: CL.SLIGHTLY_HIGH,
                shipQuality: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //this is the only relationship that cannot be dissolved mid-event
        for (const fx of this.endEffects) fx.newRelationship = RELATIONSHIP_TYPES.NEUTRAL

        // Cancelled: relationship soured before alliance solidified
        this.cancelEndEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                territory: News.clHalfRegression(CL.HIGH),
                marketCargoAmounts: News.clHalfRegression(CL.SLIGHTLY_HIGH),
                prestige: CL.LOW, // diplomatic failure
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                territory: News.clHalfRegression(CL.HIGH),
                marketCargoAmounts: News.clHalfRegression(CL.SLIGHTLY_HIGH),
                prestige: CL.LOW,
            })
        ]
    }

    determineEnding() {
        const {planet, targetPlanet} = this
        // Check if relationships are still friendly
        const rel1 = planet.culture.relationships.get(targetPlanet)
        const rel2 = targetPlanet.culture.relationships.get(planet)
        if (rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.HOSTILE || rel1 === RELATIONSHIP_TYPES.WAR ||
            rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.HOSTILE || rel2 === RELATIONSHIP_TYPES.WAR) {
            this.cancelled = true
        }
    }

    getAllies(planet = new Planet()) {
        const allies = []
        for (const p of gs.system.planets) {
            const rel = planet.culture.relationships.get(p)
            if (rel == RELATIONSHIP_TYPES.ALLY) {
                allies.push(p)
            }
        }
        return allies
    }

    isValid() {
        const {planet, targetPlanet} = this
        //both planets must be currently neutral towards each other
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL)
        //never ally with an opposing govt OR someone who is allied to one!!!
        const opposingGovernmentsValid = 
            (planet.culture.governmentType.opposingType !== targetPlanet.culture.governmentType)
            && (targetPlanet.culture.governmentType.opposingType !== planet.culture.governmentType)
        /*const alliedToOpposingGovtValid = 
            !(this.getAllies(targetPlanet).some(ally => ally.culture.governmentType === planet.culture.governmentType.opposingType))
            && !(this.getAllies(planet).some(ally => ally.culture.governmentType === targetPlanet.culture.governmentType.opposingType))*/
        const alliedToOpposingGovtValid = true //was a bit too harsh earlier
        //most of the below shouldnt be possible based on above checked but just in case
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.ALLIANCE, ...NT_COOPERATION_PREVENTING]) || 
            News.hasNews(NT.PLAGUE, planet) || News.hasNews(NT.PLAGUE, targetPlanet)
        return opposingGovernmentsValid && relationshipsValid && alliedToOpposingGovtValid && !interferingEvent
    }
}
