class InflationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Inflation spirals out of control on ${coloredName(planet)}!`,
            `Inflation finally subsides on ${coloredName(planet)}!`,
            NEWS_TYPES.INFLATION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                commerceModifiedBy: 0.7,
                marketPricesModifiedBy: 1.4,
                marketCargoAmountsModifiedBy: 0.8,
                creditsModifiedBy: 1.5,
                crimeModifiedBy: 1.2,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering price increases and deflation
        Object.assign(this.endEffects[0], {
            commerceModifiedBy: (1 + this.endEffects[0].commerceModifiedBy)/2,
            marketCargoAmountsModifiedBy: (1 + this.endEffects[0].marketCargoAmountsModifiedBy)/2,
            creditsModifiedBy: 1/(1.5+1) //what goes up, must come down
        })
    }

    isValid() {
        const {planet} = this
        //not likely when credit is high and higher than available goods
        const ratingsValid = 
            planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS > 1 &&
            planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS > planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE
        const interferingEvent = News.hasNews(NEWS_TYPES.INFLATION, planet) //same time as economic boom is possible!
        return ratingsValid && !interferingEvent
    }
}
