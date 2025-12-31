class ScientificBreakthroughNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins work on a major scientific project!`,
            `${coloredName(planet)} completes their scientific project, unlocking a major new ships!`,
            `${coloredName(planet)}'s scientific project fails to yield results!`,
            ``,
            NT.SCIENTIFIC_BREAKTHROUGH, planet
        )

        this.addPlanetEffect(
            {
                planet: this.planet,
                wealth: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, 2]]))
            },
            {
                technology: CL.HIGH,
                education: CL.SLIGHTLY_HIGH,
            },
            {
                wealth: CL.NO_REGRESSION,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Research succeeds based on education quality and economy
        this.rollOutcome(p.c.education * 0.6 + p.c.economy * 0.3 + 0.1)
    }

    isValid() {
        const {planet: p} = this
        //needs money. wont bother if we're already at the top
        const ratingsValid = planet.settlement.market.baseCredits/MARKET_AVERAGE_CREDITS > CL.MEDIUM && p.c.technology < CL.EXTREMELY_HIGH
        //hard times dont block it, may actually accelerate technological progress
        const interferingEvent = News.hasNews(NT.SCIENTIFIC_BREAKTHROUGH, planet)
        return ratingsValid && !interferingEvent
    }
}
