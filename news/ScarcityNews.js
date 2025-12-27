class ScarcityNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s overconsumption has led to famine and scarcity!`,
            `${coloredName(planet)}'s great famine ends!`,
            NEWS_TYPES.SCARCITY, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                marketPrices: CL.VERY_HIGH,
                marketCargoAmounts: 0.4,
                industry: CL.LOW,
                commerce: CL.LOW,
                blackMarketCargoAmounts: CL.LOW,
                blackMarketPrices: CL.VERY_HIGH,
                crime: CL.HIGH,
                shipyardNumShips: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //population does not fully bounce back
        Object.assign(this.endEffects[0], {
            population: News.clHalfRegression(this.endEffects[0].population),
            industry: News.clHalfRegression(this.endEffects[0].industry),
        })
    }

    isValid() {
        const {planet} = this
        //more likely if high pop and high industry
        const ratingsValid = planet.culture.population >= 1.25 && planet.culture.industry >= 1.25
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.SCARCITY, ...NEWS_TYPES_ECONOMY_BOOSTING])
        return ratingsValid && !interferingEvent
    }
}
