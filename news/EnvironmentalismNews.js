class EnvironmentalismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s people are de-industrializing to save their planet's natural beauty!`,
            `${coloredName(planet)} has de-industrialized, giving their planet room to breathe again!`,
            `${coloredName(planet)}'s environmental movement collapses amid economic crisis!`,
            ``,
            NT.ENVIRONMENTALISM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.EXTREMELY_LOW,
                technology: CL.VERY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.NANITES, CL.EXTREMELY_LOW], [CARGO_TYPES.METAL, CL.EXTREMELY_LOW]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //market, economy, industry do not fully bounce back
        Object.assign(this.completeEffects[0], {
            population: CL.SLIGHTLY_HIGH,
            technology: News.clHalfRegression(this.completeEffects[0].technology),
            industry: News.clHalfRegression(this.completeEffects[0].industry),
            prestige: CL.SLIGHTLY_HIGH,
        })

        // Failed: movement collapses, industry rebounds but damage to environment
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: News.clHalfRegression(CL.EXTREMELY_LOW), // partial de-industrialization
                economy: CL.LOW, // economic disruption
                prestige: CL.LOW, // movement failure
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Movement fails if economy becomes too weak to sustain
        const failProbability = (1 - planet.civilization.economy) * 0.35
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet} = this
        //happens when industry is getting out of hand
        const ratingsValid = planet.civilization.industry >= CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.ENVIRONMENTALISM, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
