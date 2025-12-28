class AddictionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is suffering an addiction crisis! Synthetic drugs are ravaging the population!`,
            `${coloredName(planet)}'s addiction crisis begins to mellow out!`,
            NEWS_TYPES.ADDICTION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                security: CL.LOW,
                crime: CL.HIGH,
                commerce: CL.LOW,
                blackMarketCargoAmounts: CL.VERY_LOW,
                blackMarketPrices: CL.VERY_HIGH,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, CL.VERY_HIGH], [CARGO_TYPES.DRUGS, 3]]), //this is the only thing that normalizes after
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            population: News.clHalfRegression(this.endEffects[0].population),
            blackMarketPrices: News.clHalfRegression(this.endEffects[0].blackMarketPrices),
            blackMarketCargoAmounts: News.clHalfRegression(this.endEffects[0].blackMarketCargoAmounts),
            crime: News.clHalfRegression(this.endEffects[0].crime),
        })
    }

    isValid() {
        const {planet} = this
        //more likely if high drug availability
        const ratingsValid = (planet.settlement.blackMarket.baseCargo.getAmount(CARGO_TYPES.DRUGS) / MARKET_AVERAGE_CARGO_PER_TYPE) > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.ADDICTION, ...NEWS_TYPES_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
