class ScarcityNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is suffering famine and scarcity!`,
            `${coloredName(planet)}'s great famine ends!`,
            NEWS_TYPES.SCARCITY, planet
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
                shipQualityModifiedBy: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 2]]),

            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    isValid() {
        const {planet} = this
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.ECONOMIC_BOOM) || News.hasNews(planet, NEWS_TYPES.SCARCITY) || News.hasNews(planet, NEWS_TYPES.SURPLUS)
        return !interferingEvent
    }
}
