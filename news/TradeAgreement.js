class TradeAgreementNews extends News {
    constructor(planet = new Planet(), startYear = gs.year, targetPlanet = new Planet()) {
        super(
            `Trade agreement signed between ${coloredName(planet)} and ${coloredName(targetPlanet)}`,
            `Trade agreement ended between ${coloredName(planet)} and ${coloredName(targetPlanet)}`,
            NEWS_TYPES.TRADE_AGREEMENT, planet, targetPlanet, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                marketCargoAmountsModifiedBy: 1.3,
                guildNumOfficersModifiedBy: 1.2,
                commercialRatingModifiedBy: 1.3,
                officerQualityModifiedBy: 1.1,
                shipQualityModifiedBy: 1.1,
                bankCreditsModifiedBy: 1.2,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                marketCargoAmountsModifiedBy: 1.3,
                guildNumOfficersModifiedBy: 1.2,
                commercialRatingModifiedBy: 1.3,
                officerQualityModifiedBy: 1.1,
                shipQualityModifiedBy: 1.1,
                bankCreditsModifiedBy: 1.2,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    isValid(planet = new Planet(), targetPlanet = new Planet()) {
        //planets must be neutral or allied towards each other
        const relationship = planet.culture.relationships.get(targetPlanet)
        const relationshipValid = relationship == RELATIONSHIP_TYPES.Neutral || relationship == RELATIONSHIP_TYPES.Ally
        const interferingEvent =
            News.hasNews(planet, NEWS_TYPES.TRADE_AGREEMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TRADE_AGREEMENT, planet) ||
            News.hasNews(planet, NEWS_TYPES.WAR, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.WAR, planet) ||
            News.hasNews(planet, NEWS_TYPES.TENSIONS, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TENSIONS, planet) ||
            News.hasNews(planet, NEWS_TYPES.BOMBARDMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.BOMBARDMENT, planet) ||
            News.hasNews(planet, NEWS_TYPES.SCARCITY) || News.hasNews(targetPlanet, NEWS_TYPES.SCARCITY)
        return relationshipValid && !interferingEvent
    }
}
