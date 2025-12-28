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
                marketPrices: CL.EXTREMELY_HIGH,
                marketCargoAmounts: CL.EXTREMELY_LOW,
                industry: CL.LOW,
                commerce: CL.LOW,
                blackMarketCargoAmounts: CL.LOW,
                blackMarketPrices: CL.HIGH,
                crime: CL.HIGH,
                shipyardNumShips: CL.VERY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, CL.ASTRONOMICAL]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //population does not fully bounce back
        Object.assign(this.endEffects[0], {
            population: News.clHalfRegression(this.endEffects[0].population),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            commerce: News.clHalfRegression(this.endEffects[0].commerce),
        })
    }

    isValid() {
        const {planet} = this
        //more likely if high pop and high industry
        const ratingsValid = planet.culture.population > CL.HIGH && planet.culture.industry >= CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.SCARCITY, ...NEWS_TYPES_ECONOMY_BOOSTING])
        return ratingsValid && !interferingEvent
    }
}
