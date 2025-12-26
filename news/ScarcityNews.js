class ScarcityNews extends News {
    constructor(planet = new Planet(), startYear = gs.year) {
        super(
            `Resource scarcity hits ${coloredName(planet)}!`,
            `${coloredName(planet)}'s resource scarcity ends!`,
            NEWS_TYPES.SCARCITY, planet, null, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPricesModifiedBy: 1.5,
                marketCargoAmountsModifiedBy: 0.4,
                industrialRatingModifiedBy: 0.8,
                commercialRatingModifiedBy: 0.8,
                blackMarketCargoAmountsModifiedBy: 1.5,
                crimeRatingModifiedBy: 1.2,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    static isValid(planet = new Planet()) {
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.ECONOMIC_BOOM) || News.hasNews(planet, NEWS_TYPES.SCARCITY)
        return !interferingEvent
    }
}
