class AllianceNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Alliance formed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Alliance dissolved between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            NEWS_TYPES.ALLIANCE, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.ALLY,
                territoryModifiedBy: 1.2,
                marketCargoAmountsModifiedBy: 1.1,
                guildNumOfficersModifiedBy: 1.2,
                securityModifiedBy: 1.1,
                commerceModifiedBy: 1.1,
                officerQualityModifiedBy: 1.1,
                shipQualityModifiedBy: 1.1,
                prestigeModifiedBy: 1.1,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.ALLY,
                territoryModifiedBy: 1.2,
                marketCargoAmountsModifiedBy: 1.1,
                guildNumOfficersModifiedBy: 1.2,
                securityModifiedBy: 1.1,
                commerceModifiedBy: 1.1,
                officerQualityModifiedBy: 1.1,
                shipQualityModifiedBy: 1.1,
                prestigeModifiedBy: 1.1,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //this is the only relationship that cannot be dissolved mid-event
        for (const fx of this.endEffects) fx.newRelationship = RELATIONSHIP_TYPES.NEUTRAL
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
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.ALLIANCE, ...NEWS_TYPES_HOSTILE]) || 
            News.hasNews(NEWS_TYPES.PLAGUE, planet) || News.hasNews(NEWS_TYPES.PLAGUE, targetPlanet)
        return opposingGovernmentsValid && relationshipsValid && alliedToOpposingGovtValid && !interferingEvent
    }
}
