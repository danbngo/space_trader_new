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
                security: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.ALLY,
                territory: CL.HIGH,
                reserves: CL.SLIGHTLY_HIGH,
                economy: CL.HIGH, // workforce expansion through trade
                security: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //this is the only relationship that cannot be dissolved mid-event
        for (const fx of this.completeEffects) fx.newRelationship = RELATIONSHIP_TYPES.NEUTRAL

        // Cancelled: relationship soured before alliance solidified
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                territory: News.clHalfRegression(CL.HIGH),
                reserves: News.clHalfRegression(CL.SLIGHTLY_HIGH),
                prestige: CL.LOW, // diplomatic failure
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                territory: News.clHalfRegression(CL.HIGH),
                reserves: News.clHalfRegression(CL.SLIGHTLY_HIGH),
                prestige: CL.LOW,
            })
        ]
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if relationships are still friendly
        const rel1 = planet.civilization.relationships.get(targetPlanet)
        const rel2 = targetPlanet.civilization.relationships.get(planet)
        if (rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.WAR ||
            rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.WAR) {
            this.cancelled = true
        }
    }

    getAllies(planet = new Planet()) {
        const allies = []
        for (const p of gs.system.planets) {
            const rel = planet.civilization.relationships.get(p)
            if (rel == RELATIONSHIP_TYPES.ALLY) {
                allies.push(p)
            }
        }
        return allies
    }

    isValid() {
        const {planet, targetPlanet} = this
        //both planets must be currently neutral towards each other
        const relationships = [planet.civilization.relationships.get(targetPlanet), targetPlanet.civilization.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL)
        //never ally with an opposing govt OR someone who is allied to one!!!
        const opposingGovernmentsValid = 
            (planet.civilization.governmentType.opposingType !== targetPlanet.civilization.governmentType)
            && (targetPlanet.civilization.governmentType.opposingType !== planet.civilization.governmentType)
        /*const alliedToOpposingGovtValid = 
            !(this.getAllies(targetPlanet).some(ally => ally.civilization.governmentType === planet.civilization.governmentType.opposingType))
            && !(this.getAllies(planet).some(ally => ally.civilization.governmentType === targetPlanet.civilization.governmentType.opposingType))*/
        const alliedToOpposingGovtValid = true //was a bit too harsh earlier
        //most of the below shouldnt be possible based on above checked but just in case
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.ALLIANCE, ...NT_COOPERATION_PREVENTING]) || 
            News.hasNews(NT.PLAGUE, planet) || News.hasNews(NT.PLAGUE, targetPlanet)
        return opposingGovernmentsValid && relationshipsValid && alliedToOpposingGovtValid && !interferingEvent
    }
}
