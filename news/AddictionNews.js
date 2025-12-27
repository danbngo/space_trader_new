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
                population: 0.9,
                security: 0.6,
                crime: 1.3,
                commerce: 0.8,
                blackMarketCargoAmounts: 0.6,
                blackMarketPrices: 1.4,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, 1.5], [CARGO_TYPES.DRUGS, 3]]), //this is the only thing that normalizes after
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            population: 1,
            blackMarketPrices: (1 + this.endEffects[0].blackMarketPrices)/2,
            blackMarketCargoAmounts: (1 + this.endEffects[0].blackMarketCargoAmounts)/2,
            crime: (1 + this.endEffects[0].crime)/2,
        })
    }

    isValid() {
        const {planet} = this
        //more likely if high drug availability
        const ratingsValid = (planet.settlement.blackMarket.baseCargo.getAmount(CARGO_TYPES.DRUGS) / MARKET_AVERAGE_CARGO_PER_TYPE) > 1.25
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.ADDICTION, ...NEWS_TYPES_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
