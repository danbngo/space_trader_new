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
                civilizationMultipliers: new Civilization({
                    industry: CL.LOW,
                    wealth: CL.LOW,
                    reserves: CL.SLIGHTLY_LOW
                }),
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, 2]]))
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Actual knowledge gained cannot be lost
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.SLIGHTLY_HIGH,
            technology: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            education: CL.SLIGHTLY_HIGH,
            military: CL.SLIGHTLY_HIGH
        }))

        // Failed: research yields nothing, resources wasted
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.NO_REGRESSION,  // Money wasted
            prestige: CL.LOW  // Scientific embarrassment
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
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
