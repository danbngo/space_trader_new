class EnvironmentalDisasterNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s polluting has led to environmental disaster! Efforts to reverse climate change are underway!`,
            `${coloredName(planet)} has reversed the climate change afflicting their planet! The planet is sparkling!`,
            `${coloredName(planet)}'s efforts to reverse climate change fail, leaving the planet permanently scarred!`,
            ``,
            NT.ENVIRONMENTAL_DISASTER, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    industry: CL.LOW,
                    reserves: CL.LOW,
                    population: CL.SLIGHTLY_LOW,
                    wealth: CL.SLIGHTLY_LOW,
                    inflation: CL.SLIGHTLY_HIGH,
                    economy: CL.SLIGHTLY_LOW,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WATER, CL.VERY_HIGH], [CARGO_TYPES.MEDICINE, CL.VERY_HIGH]])),
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            culture: CL.HIGH,
            reserves: CL.SLIGHTLY_LOW,
            wealth: CL.SLIGHTLY_LOW,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            industry: CL.VERY_LOW,
            reserves: CL.LOW,
            population: CL.LOW,
            wealth: CL.SLIGHTLY_LOW,
            inflation: CL.SLIGHTLY_HIGH,
            economy: CL.LOW,
        }))
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome((p.c.technology + p.c.education + p.c.culture + p.c.taxes) / 4, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        //happens when industry is getting out of hand
        const ratingsValid = p.c.industry >= CL.HIGH
        return ratingsValid
    }
}
