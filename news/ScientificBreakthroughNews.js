class ScientificBreakthroughNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins work on a major scientific project!`,
            `${coloredName(planet)} completes their scientific project, unlocking a major new ships!`,
            `${coloredName(planet)}'s scientific project fails to yield results!`,
            ``,
            NT.SCIENTIFIC_BREAKTHROUGH, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.LOW,
                wealth: CL.LOW,
                reserves: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, 2]])),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //actual knowledge gained cannot be lost
        Object.assign(this.completeEffects[0], {
            wealth: News.clHalfRegression(this.completeEffects[0].wealth),
            technology: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            education: CL.SLIGHTLY_HIGH,
            army: CL.SLIGHTLY_HIGH,
            navy: CL.SLIGHTLY_HIGH,
        })

        // Failed: research yields nothing, resources wasted
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                wealth: CL.NO_REGRESSION, // money wasted
                prestige: CL.LOW, // scientific embarrassment
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Research fails based on officer quality and economy
        const successProbability = (p.c.education * 0.6) + (p.c.economy * 0.3) + 0.1
        this.failed = Math.random() > successProbability
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
