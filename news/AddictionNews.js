class AddictionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is suffering an addiction crisis! Synthetic drugs are ravaging the population!`,
            `${coloredName(planet)}'s addiction crisis was successfully mitigated by the government!`,
            `${coloredName(planet)}'s addiction crisis has become terminal with no end in sight!`,
            '',
            NT.ADDICTION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    security: CL.LOW,
                    economy: CL.LOW,
                    crime: CL.HIGH,
                    corruption: CL.HIGH,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.MEDICINE, CL.VERY_HIGH], [CARGO_TYPES.DRUGS, CL.EXTREMELY_HIGH]])),
                })
            })
        ]
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            culture: CL.HIGH,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_LOW,
            security: CL.LOW,
            economy: CL.LOW,
            crime: CL.HIGH,
            corruption: CL.HIGH,
            culture: CL.SLIGHTLY_LOW,
        }))
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher security and culture helps mitigate
        this.rollOutcome(p.c.security*p.c.culture, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        //more likely if high drug availability
        const ratingsValid = (p.c.crime*p.c.corruption/p.c.security) > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(p, NT_CRIME_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
