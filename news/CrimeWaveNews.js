class CrimeWaveNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Chronic poverty on ${coloredName(planet)} leads to a massive crime wave!`,
            `Authorities regain control as the crime wave on ${coloredName(planet)} ends!`,
            `${coloredName(planet)} fails to stop the vicious cycle of crime, leaving wide swaths of the planet in chaos!`,
            '',
            NT.CRIME_WAVE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                security: CL.LOW,
                crime: CL.VERY_HIGH,
                corruption: CL.HIGH,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.WEAPONS, CL.EXTREMELY_LOW], [CARGO_TYPES.DRUGS, CL.EXTREMELY_LOW]]),
            })
        ]

        this.completeEffects = [
            new NewsEffect({
                planet:this.planet,
                security: CL.HIGH/CL.LOW,
                cargoPriceMultipliers: NewsEffect.getInvertedCargoPriceMultipliers(this.startEffects[0].cargoPriceMultipliers),
            })
        ]

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.failEffects[0], {
            security: CL.NO_REGRESSION,
            crime: CL.EXTREMELY_HIGH/CL.VERY_HIGH,
            corruption: CL.VERY_HIGH/CL.HIGH,
        })
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome(planet.civilization.security*planet.civilization.culture*planet.civilization.economy)
    }

    isValid() {
        const {planet: p} = this
        //wont happen if crime or security is already high
        const povertyValid = planet.civilization.wealth < CL.MEDIUM
        const ratingsValid = planet.settlement.cryme < CL.MEDIUM && planet.civilization.security < CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(planet, [NT.CRIME_WAVE, ...NT_CRIME_PREVENTING])
        return ratingsValid && povertyValid && !interferingEvent
    }
}
