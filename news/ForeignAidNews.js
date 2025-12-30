class ForeignAidNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s plight inspires other planets to send it foreign aid!`,
            `${coloredName(planet)}'s foreign aid finally dries up!`,
            `${coloredName(planet)} squanders foreign aid on corruption and mismanagement!`,
            ``,
            NT.FOREIGN_AID, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                inflation: CL.LOW,
                reserves: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_HIGH,
                wealth: CL.HIGH,
                navy: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.completeEffects[0], {
            inflation: News.clHalfRegression(this.completeEffects[0].inflation),
            reserves: News.clHalfRegression(this.completeEffects[0].reserves),
            economy: News.clHalfRegression(this.completeEffects[0].economy),
            wealth: News.clHalfRegression(this.completeEffects[0].wealth),
            industry: News.clHalfRegression(this.completeEffects[0].industry),
            navy: News.clHalfRegression(this.completeEffects[0].navy),
            prestige: CL.NO_REGRESSION //not the best for your reputation
        })

        // Failed: aid wasted through corruption
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.NO_REGRESSION, // no economic gain
                industry: CL.NO_REGRESSION,
                wealth: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW, // international embarrassment
                crime: CL.HIGH, // corruption spike
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Aid fails if governance is too weak (low security means corruption)
        const failProbability = (1 - planet.civilization.security) * 0.4
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet: p} = this
        //more likely to happen when economy is poor and has some prestige to burn
        const economyValid = planet.civilization.economy < CL.LOW && planet.civilization.industry < CL.LOW && planet.civilization.wealth < CL.LOW
        const prestigeValid = planet.civilization.prestige > CL.LOW
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.FOREIGN_AID, ...NT_ECONOMY_BOOSTING])
        return economyValid && prestigeValid && !interferingEvent
    }
}
