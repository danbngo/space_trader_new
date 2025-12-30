class ScarcityNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s overconsumption has led to famine and scarcity!`,
            `${coloredName(planet)}'s great famine ends!`,
            `${coloredName(planet)}'s famine spirals into catastrophic collapse!`,
            ``,
            NT.SCARCITY, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                inflation: CL.EXTREMELY_HIGH,
                reserves: CL.EXTREMELY_LOW,
                industry: CL.LOW,
                economy: CL.LOW,
                crime: CL.HIGH,
                corruption: CL.HIGH,
                navy: CL.VERY_LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.WATER, CL.ASTRONOMICAL]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //population does not fully bounce back
        Object.assign(this.completeEffects[0], {
            population: News.clHalfRegression(this.completeEffects[0].population),
            industry: News.clHalfRegression(this.completeEffects[0].industry),
            economy: News.clHalfRegression(this.completeEffects[0].economy),
        })

        // Failed: famine becomes catastrophic
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.NO_REGRESSION, // massive die-off
                industry: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION, // lawlessness persists
                prestige: CL.VERY_LOW, // failed state
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Scarcity becomes catastrophic if economy/industry collapse further
        const failProbability = (1 - planet.civilization.economy) * (1 - planet.civilization.industry) * 0.3
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet} = this
        //more likely if high pop and high industry
        const ratingsValid = planet.civilization.population > CL.HIGH || planet.civilization.industry >= CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.SCARCITY, ...NT_ECONOMY_BOOSTING])
        return ratingsValid && !interferingEvent
    }
}
