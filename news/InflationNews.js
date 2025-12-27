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
                commerce: 0.7,
                marketPrices: 1.4,
                marketCargoAmounts: 0.8,
                credits: 1.5,
                crime: 1.2,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering price increases and deflation
        Object.assign(this.endEffects[0], {
            commerce: (1 + this.endEffects[0].commerce)/2,
            marketCargoAmounts: (1 + this.endEffects[0].marketCargoAmounts)/2,
            credit: (1/(0.5+1.5))
        })
    }

    isValid() {
        const {planet} = this
        //not likely when credit is high 
        const ratingsValid = 
            (planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS) > 1.5 
        const interferingEvent = News.hasNews(NEWS_TYPES.INFLATION, planet) //same time as economic boom is possible!
        return ratingsValid && !interferingEvent
    }
}
