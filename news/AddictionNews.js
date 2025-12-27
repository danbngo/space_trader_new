class AddictionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is suffering an addiction crisis! Sythetic drugs are ravaging the population!`,
            `${coloredName(planet)} has overcome its addiction crisis!`,
            NEWS_TYPES.CIVIL_STRIFE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                security: 0.6,
                crime: 1.3,
                commerce: 0.8,
                blackMarketCargoAmounts: 1.5,
                blackMarketPrices: 0.6,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, 1.5], [CARGO_TYPES.DRUGS, 3]]), //this is the only thing that normalizes after
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            blackMarketPrices: (1 + this.endEffects[0].blackMarketPrices)/2,
            blackMarketCargoAmounts: (1 + this.endEffects[0].blackMarketCargoAmounts)/2,
            crime: (1 + this.endEffects[0].crime)/2,
        })
    }

    isValid() {
        const {planet} = this
        //more likely if lots of disposable income and not already awash in crime
        const ratingsValid = planet.settlement.market.baseCredits / MARKET_AVERAGE_CREDITS > 1.5 && planet.settlement.blackMarket.baseCargo.average / MARKET_AVERAGE_CARGO_PER_TYPE < 1.5
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.ADDICTION, ...NEWS_TYPES_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
