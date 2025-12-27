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
                industryModifiedBy: 0.8,
                commerceModifiedBy: 0.8,
                blackMarketCargoAmountsModifiedBy: 1.5,
                crimeModifiedBy: 1.2,
                shipQualityModifiedBy: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 2]]),

            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    isValid() {
        const {planet} = this
        //more likely if high pop and high industry
        const ratingsValid = planet.culture.population >= 1.2 && planet.culture.industry >= 1.2
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.SCARCITY, ...NEWS_TYPES_ECONOMY_BOOSTING])
        return ratingsValid && !interferingEvent
    }
}
