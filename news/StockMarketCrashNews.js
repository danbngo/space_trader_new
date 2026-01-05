class StockMarketCrashNews extends News {
    constructor(planet = new Planet()) {
        super(
            `The stock market on ${coloredName(planet)} crashes catastrophically! Financial institutions reel from massive losses!`,
            `${coloredName(planet)}'s financial markets rally as powerful investors step in to stabilize the situation.`,
            `${coloredName(planet)}'s financial markets collapse completely, causing widespread economic turmoil!`,
            ``,
            NT.STOCK_MARKET_CRASH, planet
        )

        this.addPlanetEffect(
            {
                economy: CL.VERY_LOW,
                wealth: CL.EXTREMELY_LOW
            },
            {
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                taxes: CL.LOW,
                reserves: CL.LOW
            }
        )
    }

    isValid() {
        const {planet: p} = this
        // More likely when credit is very high (bubble about to burst)
        const ratingsValid = p.c.wealth > CL.VERY_HIGH || p.c.economy > CL.VERY_HIGH
        return ratingsValid
    }
}
