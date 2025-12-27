class StockMarketCrashNews extends News {
    constructor(planet = new Planet()) {
        super(
            `The stock market on ${coloredName(planet)} crashes catastrophically! Financial institutions reel from massive losses!`,
            `${coloredName(planet)}'s financial markets stabilize from their crash.`,
            NEWS_TYPES.STOCK_MARKET_CRASH, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.VERY_LOW,
                commerce: CL.VERY_LOW,
                credits: 0.2,
                marketCargoAmounts: CL.LOW,
                marketPrices: CL.HIGH,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Commerce damage and credit scarcity are partially permanent
        Object.assign(this.endEffects[0], {
            credits: News.clHalfRegression(this.endEffects[0].credits),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            commerce: News.clHalfRegression(this.endEffects[0].commerce),
        })
    }

    isValid() {
        const {planet} = this
        // More likely when credit is very high (bubble about to burst)
        const ratingsValid = 
            (planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS) > 1.5 
        const interferingEvent = News.hasNews(NEWS_TYPES.STOCK_MARKET_CRASH, planet)
        return ratingsValid && !interferingEvent
    }
}
