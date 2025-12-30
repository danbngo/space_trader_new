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
                population: CL.LOW,
                security: CL.LOW,
                economy: CL.LOW,
                crime: CL.HIGH,
                corruption: CL.HIGH,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, CL.VERY_HIGH], [CARGO_TYPES.DRUGS, CL.EXTREMELY_HIGH]]), //this is the only thing that normalizes after
            })
        ]
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.failEffects[0], {
            cargoPriceModifiers: NewsEffect.getInvertedCargoPriceModifiers(this.startEffects[0].cargoPriceModifiers)            
        })
    }

    determineOutcome() {
        const {planet} = this
        // Higher security and culture helps mitigate
        this.rollOutcome(planet.civilization.security*planet.civilization.culture, CL.MEDIUM)
    }

    isValid() {
        const {planet} = this
        //more likely if high drug availability
        const ratingsValid = (planet.civilization.crime*planet.civilization.corruption/planet.civilization.security) > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.ADDICTION, ...NT_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
