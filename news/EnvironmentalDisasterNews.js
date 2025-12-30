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
                civilizationMultipliers: new Civilization({
                    inflation: CL.SLIGHTLY_HIGH,
                    reserves: CL.LOW,
                    economy: CL.SLIGHTLY_LOW,
                    industry: CL.VERY_LOW,
                    population: CL.SLIGHTLY_LOW,
                    wealth: CL.LOW,
                    navy: CL.LOW,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WATER, CL.VERY_HIGH], [CARGO_TYPES.MEDICINE, CL.VERY_HIGH]])),
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            inflation: CL.SLIGHTLY_HIGH,
            reserves: CL.SLIGHTLY_LOW,
            industry: CL.SLIGHTLY_LOW,
            population: CL.SLIGHTLY_LOW,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            industry: CL.VERY_LOW,
            population: CL.SLIGHTLY_LOW,
            economy: CL.SLIGHTLY_LOW,
            reserves: CL.LOW,
            prestige: CL.VERY_LOW,
        }))
    }

    determineOutcome() {
        this.rollOutcome((this.planet.c.economy + this.planet.c.industry) / 2)
    }

    isValid() {
        const {planet: p} = this
        //happens when industry is getting out of hand
        const ratingsValid = p.c.industry >= CL.HIGH
        const interferingEvent = News.hasNews(NT.ENVIRONMENTAL_DISASTER, planet)
        return ratingsValid && !interferingEvent
    }
}
