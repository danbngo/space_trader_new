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
                civilizationMultipliers: new Civilization({
                    industry: CL.EXTREMELY_LOW,
                    navy: CL.VERY_LOW,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.NANITES, CL.EXTREMELY_LOW], [CARGO_TYPES.METAL, CL.EXTREMELY_LOW]])),
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_HIGH,
            navy: CL.SLIGHTLY_LOW,
            industry: CL.SLIGHTLY_LOW,
            prestige: CL.SLIGHTLY_HIGH,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            industry: CL.SLIGHTLY_LOW,
            economy: CL.LOW,
            prestige: CL.LOW,
        }))
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.economy)
    }

    isValid() {
        const {planet: p} = this
        //happens when industry is getting out of hand
        const ratingsValid = p.c.industry >= CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.ENVIRONMENTALISM, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
