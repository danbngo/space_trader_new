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
                civilizationMultipliers: new Civilization({
                    population: CL.LOW,
                    inflation: CL.EXTREMELY_HIGH,
                    reserves: CL.EXTREMELY_LOW,
                    industry: CL.LOW,
                    economy: CL.LOW,
                    crime: CL.HIGH,
                    corruption: CL.HIGH,
                    military: CL.VERY_LOW
                }),
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WATER, CL.ASTRONOMICAL]]))
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Population does not fully bounce back
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_LOW,
            industry: CL.SLIGHTLY_LOW,
            economy: CL.SLIGHTLY_LOW
        }))

        // Failed: famine becomes catastrophic
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.NO_REGRESSION,  // Massive die-off
            industry: CL.NO_REGRESSION,
            economy: CL.NO_REGRESSION,
            crime: CL.NO_REGRESSION,  // Lawlessness persists
            prestige: CL.VERY_LOW  // Failed state
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
    }

    determineOutcome() {
        const {planet: p} = this
        // Scarcity ends unless economy/industry collapse further
        this.rollOutcome(1 - (1 - p.c.economy) * (1 - p.c.industry) * 0.3)
    }

    isValid() {
        const {planet: p} = this
        //more likely if high pop and high industry
        const ratingsValid = p.c.population > CL.HIGH || p.c.industry >= CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.SCARCITY, ...NT_ECONOMY_BOOSTING])
        return ratingsValid && !interferingEvent
    }
}
