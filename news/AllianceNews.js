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
                civilizationMultipliers: new Civilization({
                    security: CL.SLIGHTLY_HIGH,
                    economy: CL.SLIGHTLY_HIGH,
                    technology: CL.SLIGHTLY_HIGH,
                    prestige: CL.SLIGHTLY_HIGH,
                    army: CL.SLIGHTLY_HIGH,
                    navy: CL.SLIGHTLY_HIGH
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.ALLY,
                civilizationMultipliers: new Civilization({
                    security: CL.SLIGHTLY_HIGH,
                    economy: CL.SLIGHTLY_HIGH,
                    technology: CL.SLIGHTLY_HIGH,
                    prestige: CL.SLIGHTLY_HIGH,
                    army: CL.SLIGHTLY_HIGH,
                    navy: CL.SLIGHTLY_HIGH
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //this is the only relationship that cannot be dissolved mid-event
        this.completeEffects[0].onApply = ()=>{
            if (this.planet.civilization.relationships.get(this.targetPlanet) == RELATIONSHIP_TYPES.ALLY) {
                this.planet.civilization.relationships.set(this.targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
            }
            if (this.targetPlanet.civilization.relationships.get(this.planet) == RELATIONSHIP_TYPES.ALLY) {
                this.targetPlanet.civilization.relationships.set(this.planet, RELATIONSHIP_TYPES.NEUTRAL)
            }
        }

        // Cancelled: relationship soured before alliance solidified
        this.cancelEffects = []
    }

    determineOutcome() {
        if (Civilization.areTenseOrAtWar(this.planet, this.targetPlanet)) {
            this.cancelled = true
        }
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
