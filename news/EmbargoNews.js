class EmbargoNews extends News {
    constructor(planet = new Planet(), startYear = gs.year, targetPlanet = new Planet()) {
        super(
            `Embargo imposed by ${coloredName(planet)} on ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)} lifts embargo on ${coloredName(targetPlanet)}!`,
            NEWS_TYPES.EMBARGO, planet, targetPlanet, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.Hostile,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.Hostile,
                commercialRatingModifiedBy: 0.6,
                marketCargoAmountsModifiedBy: 0.7,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    static isValid(planet = new Planet(), targetPlanet = new Planet()) {
        //need to have enough ships for it
        const ratingsValid = planet.culture.militaryRating > 1
        //cant be anarchic or puppet state
        const agencyValid = (planet.culture.governmentType !== GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType !== GOVERNMENT_TYPES.PUPPET_STATE)
        //planet must already be hostile to the target planet
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.Hostile
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.EMBARGO, targetPlanet) || 
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet)
        return ratingsValid && agencyValid && relationshipValid && !interferingEvent
    }
}
