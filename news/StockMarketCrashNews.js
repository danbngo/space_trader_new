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
                civilizationMultipliers: new Civilization({
                    industry: CL.VERY_LOW,
                    economy: CL.VERY_LOW,
                    wealth: CL.EXTREMELY_LOW,
                    reserves: CL.LOW,
                    inflation: CL.HIGH
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Economy damage and credit scarcity are partially permanent
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.SLIGHTLY_HIGH,
            industry: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
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
