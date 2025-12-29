class StockMarketCrashNews extends News {
    constructor(planet = new Planet()) {
        super(
            `The stock market on ${coloredName(planet)} crashes catastrophically! Financial institutions reel from massive losses!`,
            `${coloredName(planet)}'s financial markets stabilize from their crash.`,
            ``,
            ``,
            NT.STOCK_MARKET_CRASH, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.VERY_LOW,
                economy: CL.VERY_LOW,
                credits: CL.EXTREMELY_LOW,
                marketCargoAmounts: CL.LOW,
                marketPrices: CL.HIGH,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Economy damage and credit scarcity are partially permanent
        Object.assign(this.completeEffects[0], {
            credits: News.clHalfRegression(this.completeEffects[0].credits),
            industry: News.clHalfRegression(this.completeEffects[0].industry),
            economy: News.clHalfRegression(this.completeEffects[0].economy),
        })
    }

    isValid() {
        const {planet} = this
        // More likely when credit is very high (bubble about to burst)
        const ratingsValid = 
            (planet.settlement.wealth) > 1.5 
        const interferingEvent = News.hasNews(NT.STOCK_MARKET_CRASH, planet)
        return ratingsValid && !interferingEvent
    }
}
