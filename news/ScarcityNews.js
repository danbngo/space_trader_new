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
                population: 0.7,
                marketPrices: 1.5,
                marketCargoAmounts: 0.4,
                industry: 0.8,
                commerce: 0.8,
                blackMarketCargoAmounts: 1.5,
                crime: 1.2,
                shipyardNumShips: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //population does not fully bounce back
        Object.assign(this.endEffects[0], {
            population: (1 + this.endEffects[0].population)/2,
            industry: (1+ this.endEffects[0].industry)/2,
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
