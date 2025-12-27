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
                securityModifiedBy: 0.6,
                crimeModifiedBy: 1.3,
                commerceModifiedBy: 0.8,
                creditsModifiedBy: 0.7,
                blackMarketCargoAmountsModifiedBy: 1.5,
                blackMarketPricesModifiedBy: 0.6,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, 1.5], [CARGO_TYPES.DRUGS, 3]]), //this is the only thing that normalizes after
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            creditsModifiedBy: (1 + this.endEffects[0].creditsModifiedBy)/2,
            blackMarketPricesModifiedBy: (1 + this.endEffects[0].blackMarketPricesModifiedBy)/2,
            blackMarketCargoAmountsModifiedBy: (1 + this.endEffects[0].blackMarketCargoAmountsModifiedBy)/2,
            crimeModifiedBy: (1 + this.endEffects[0].crimeModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //more likely if lots of disposable income and not already awash in crime
        const ratingsValid = planet.settlement.market.baseCredits / MARKET_AVERAGE_CREDITS > 1.5 && planet.settlement.blackMarket.cargo.average / MARKET_AVERAGE_CARGO_PER_TYPE < 1.5
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.ADDICTION, ...NEWS_TYPES_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
