class CrimeWaveNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Chronic poverty on ${coloredName(planet)} leads to a massive crime wave!`,
            `Authorities regain control as the crime wave on ${coloredName(planet)} ends!`,
            `${coloredName(planet)} fails to stop the vicious cycle of crime, leaving wide swaths of the planet in chaos!`,
            '',
            NT.CRIME_WAVE, planet
        )

        this.addPlanetEffect(
            {
                security: CL.HIGH,
                crime: CL.HIGH,
                corruption: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.EXTREMELY_LOW], [CARGO_TYPES.DRUGS, CL.EXTREMELY_LOW]])),
            },
            {
                security: CL.SLIGHTLY_HIGH,
                crime: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW,
            },
            {
                security: CL.LOW,
                crime: CL.EXTREMELY_HIGH,
                corruption: CL.VERY_HIGH,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome(p.c.security*p.c.culture*p.c.economy*p.c.crime/p.c.corruption, CL.LOW)
    }

    isValid() {
        const {planet: p} = this
        //wont happen if crime or security is already high
        const ratingsValid = p.c.wealth < CL.MEDIUM && p.c.crime < CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(p, NT_CRIME_PREVENTING)
        return ratingsValid && ratingsValid && !interferingEvent
    }
}
