class TensionsNews extends News {
    constructor(planet = new Planet(), startYear = gs.year, targetPlanet = new Planet()) {
        super(
            `Tensions rise between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Tensions ease between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            NEWS_TYPES.TENSIONS, planet, targetPlanet, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.Hostile,
                securityRatingModifiedBy: 1.1,
                commercialRatingModifiedBy: 0.9,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.Hostile,
                securityRatingModifiedBy: 1.1,
                commercialRatingModifiedBy: 0.9,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    static isValid(planet = new Planet(), targetPlanet = new Planet()) {
        //planets must be neutral towards each other
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.Neutral
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.TENSIONS, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TENSIONS, planet) ||
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet) ||
            News.hasNews(planet, NEWS_TYPES.WAR, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.WAR, planet) ||
            News.hasNews(planet, NEWS_TYPES.BOMBARDMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.BOMBARDMENT, planet) ||
            News.hasNews(planet, NEWS_TYPES.TRADE_AGREEMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TRADE_AGREEMENT, planet)
        return relationshipValid && !interferingEvent
    }
}
