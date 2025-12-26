class WarNews extends News {
    constructor(planet = new Planet(), startYear = gs.year, targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} declares war on ${coloredName(targetPlanet)}!`,
            `War ended between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            NEWS_TYPES.WAR, planet, targetPlanet, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.War,
                militaryRatingModifiedBy: 1.3,
                securityRatingModifiedBy: 1.2,
                populationModifiedBy: 0.9,
                commercialRatingModifiedBy: 0.7,
                marketCargoAmountsModifiedBy: 0.6,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.War,
                militaryRatingModifiedBy: 1.3,
                securityRatingModifiedBy: 1.2,
                populationModifiedBy: 0.9,
                commercialRatingModifiedBy: 0.7,
                marketCargoAmountsModifiedBy: 0.6,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    static isValid(planet = new Planet(), targetPlanet = new Planet()) {
        //must not have same form of government
        const governmentsValid = (planet.culture.governmentType !== targetPlanet.culture.governmentType)
        //must not be anarchic or a puppet state
        const agencyValid = (planet.culture.governmentType !== GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType !== GOVERNMENT_TYPES.PUPPET_STATE)
        //target cant be a puppet state
        const fairTargetValid = (targetPlanet.culture.governmentType !== GOVERNMENT_TYPES.PUPPET_STATE)
        //planets must not already be at war
        const relationshipValid = planet.culture.relationships.get(targetPlanet) != RELATIONSHIP_TYPES.War
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.WAR, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.WAR, planet) ||
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet)
        return governmentsValid && agencyValid && fairTargetValid &&relationshipValid && !interferingEvent
    }
}
