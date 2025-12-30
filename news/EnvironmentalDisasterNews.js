class EnvironmentalDisasterNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s polluting has led to environmental disaster! Cleanup efforts are underway!`,
            `${coloredName(planet)} has cleaned up their environmental disaster, but lasting damage to the planet remains!`,
            `${coloredName(planet)}'s cleanup efforts fail, leaving the planet permanently scarred!`,
            ``,
            NT.ENVIRONMENTAL_DISASTER, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                inflation: CL.SLIGHTLY_HIGH,
                reserves: CL.LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.VERY_LOW,
                population: CL.SLIGHTLY_LOW,
                wealth: CL.LOW,
                navy: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WATER, CL.VERY_HIGH], [CARGO_TYPES.MEDICINE, CL.VERY_HIGH]])),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //market, economy, industry, population do not fully bounce back
        Object.assign(this.completeEffects[0], {
            inflation: News.clHalfRegression(this.completeEffects[0].inflation),
            reserves: News.clHalfRegression(this.completeEffects[0].reserves),
            industry: News.clHalfRegression(this.completeEffects[0].industry),
            population: News.clHalfRegression(this.completeEffects[0].population),
        })

        // Failed: cleanup fails, permanent environmental collapse
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.NO_REGRESSION, // permanent damage
                population: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                reserves: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW, // ecological disaster
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Cleanup fails if economy/industry too weak to recover
        const failProbability = (1 - planet.c.economy) * (1 - planet.c.industry) * 0.35
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet: p} = this
        //happens when industry is getting out of hand
        const ratingsValid = planet.c.industry >= CL.HIGH
        const interferingEvent = News.hasNews(NT.ENVIRONMENTAL_DISASTER, planet)
        return ratingsValid && !interferingEvent
    }
}
