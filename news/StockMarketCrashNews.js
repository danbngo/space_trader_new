class StockMarketCrashNews extends News {
    constructor(planet = new Planet()) {
        super(
            `The stock market on ${coloredName(planet)} crashes catastrophically! Financial institutions reel from massive losses!`,
            `${coloredName(planet)}'s financial markets stabilize from their crash.`,
            ``,
            ``,
            NT.STOCK_MARKET_CRASH, planet
        )

        this.addPlanetEffect(
            {
                economy: CL.VERY_LOW,
                wealth: CL.EXTREMELY_LOW,
            },
            {
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
            }
        )
    }

    isValid() {
        const {planet: p} = this
        // More likely when credit is very high (bubble about to burst)
        const ratingsValid = 
            (p.c.wealth) > 1.5 
        const interferingEvent = News.hasNews(NT.STOCK_MARKET_CRASH, planet)
        return ratingsValid && !interferingEvent
    }
}
