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

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.failEffects[0].civilizationMultipliers, {
            population: CL.SLIGHTLY_LOW,
            security: CL.NO_REGRESSION,
            economy: CL.NO_REGRESSION,
            crime: CL.NO_REGRESSION,
            corruption: CL.NO_REGRESSION,
        })
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher security and culture helps mitigate
        this.rollOutcome(p.civilization.security*p.civilization.culture, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        //more likely if high drug availability
        const ratingsValid = (p.civilization.crime*p.civilization.corruption/p.civilization.security) > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(p, [NT.ADDICTION, ...NT_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
