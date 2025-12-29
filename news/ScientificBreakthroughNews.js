class ScientificBreakthroughNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins work on a major scientific project!`,
            `${coloredName(planet)} completes their scientific project, unlocking a major new technology!`,
            `${coloredName(planet)}'s scientific project fails to yield results!`,
            ``,
            NT.SCIENTIFIC_BREAKTHROUGH, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.LOW,
                credits: CL.LOW,
                marketCargoAmounts: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ISOTOPES, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //actual knowledge gained cannot be lost
        Object.assign(this.endEffects[0], {
            credits: News.clHalfRegression(this.endEffects[0].credits),
            shipQuality: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            officerQuality: CL.SLIGHTLY_HIGH,
            military: CL.SLIGHTLY_HIGH,
        })

        // Failed: research yields nothing, resources wasted
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                credits: CL.NO_REGRESSION, // money wasted
                prestige: CL.LOW, // scientific embarrassment
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Research fails based on officer quality and economy
        const successProbability = (planet.culture.officerQuality * 0.6) + (planet.culture.economy * 0.3) + 0.1
        this.failed = Math.random() > successProbability
    }

    isValid() {
        const {planet} = this
        //needs money. wont bother if we're already at the top
        const ratingsValid = planet.settlement.market.baseCredits/MARKET_AVERAGE_CREDITS > CL.MEDIUM && planet.culture.shipQuality < CL.EXTREMELY_HIGH
        //hard times dont block it, may actually accelerate technological progress
        const interferingEvent = News.hasNews(NT.SCIENTIFIC_BREAKTHROUGH, planet)
        return ratingsValid && !interferingEvent
    }
}
