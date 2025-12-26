class AllianceNews extends News {
    constructor(planet = new Planet(), startYear = gs.year, targetPlanet = new Planet()) {
        super(
            `Alliance formed between ${coloredName(planet)} and ${coloredName(targetPlanet)}`,
            `Alliance ended between ${coloredName(planet)} and ${coloredName(targetPlanet)}`,
            NEWS_TYPES.ALLIANCE, planet, targetPlanet, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.Ally,
                territoryModifiedBy: 1.2,
                marketCargoAmountsModifiedBy: 1.1,
                guildNumOfficersModifiedBy: 1.2,
                securityRatingModifiedBy: 1.1,
                commercialRatingModifiedBy: 1.1,
                officerQualityModifiedBy: 1.1,
                shipQualityModifiedBy: 1.1,
                prestigeRatingModifiedBy: 1.1,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.Ally,
                territoryModifiedBy: 1.2,
                marketCargoAmountsModifiedBy: 1.1,
                guildNumOfficersModifiedBy: 1.2,
                securityRatingModifiedBy: 1.1,
                commercialRatingModifiedBy: 1.1,
                officerQualityModifiedBy: 1.1,
                shipQualityModifiedBy: 1.1,
                prestigeRatingModifiedBy: 1.1,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    static isValid(planet = new Planet(), targetPlanet = new Planet()) {
        //both planets must be currently neutral towards each other
        const planetValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.Neutral
        const targetPlanetValid = targetPlanet.culture.relationships.get(planet) == RELATIONSHIP_TYPES.Neutral
        //most of the below shouldnt be possible based on above checked but just in case
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet) || 
            News.hasNews(planet, NEWS_TYPES.WAR, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.WAR, planet) ||
            News.hasNews(planet, NEWS_TYPES.TENSIONS, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TENSIONS, planet) ||
            News.hasNews(planet, NEWS_TYPES.BOMBARDMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.BOMBARDMENT, planet)
        return planetValid && targetPlanetValid && !interferingEvent
    }
}
