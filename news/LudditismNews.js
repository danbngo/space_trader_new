class LudditismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} embraces a return-to-soil movement, rejecting advanced ships for a simpler life!`,
            `${coloredName(planet)}'s people have completed their transition to a more pastoral life!`,
            `${coloredName(planet)}'s luddite movement collapses as imminent threats overwhelm ideology!`,
            ``,
            NT.LUDDITISM, planet
        )

        this.addPlanetEffect(
            {
                technology: CL.VERY_LOW,
                education: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.HOLOCUBES, CL.VERY_LOW]
                ])),
                taxes: CL.LOW
            },
            {
                technology: CL.VERY_LOW,
                education: CL.SLIGHTLY_LOW,
                population: CL.HIGH,
                crime: CL.LOW,
                taxes: CL.VERY_LOW
            },
            {
                technology: CL.NO_REGRESSION,
                education: CL.NO_REGRESSION,
                population: CL.SLIGHTLY_HIGH,
            }
        )
    }

    shouldCancel() {
        return Civilization.getPlanetsAtWarWith(this.planet).length > 0
    }

    determineOutcome() {
        const {planet: p} = this
        // Movement succeeds unless economic pressures are too high
        const successProbability = p.c.economy * 0.75 + 0.25
        this.rollOutcome(successProbability)
    }

    isValid() {
        const {planet: p} = this
        //more likely if high tech and population pressure
        const ratingsValid = p.c.technology > CL.HIGH && p.c.industry > CL.MEDIUM
        //must not be at engaged in or targeted by any hostile acts
        const interferingEvent = News.planetHasAnyNews(p, NT_DANGEROUS) || News.planetHasAnyNewsTargeting(p, NT_DANGEROUS) 
        const peaceValid = Civilization.getPlanetsAtWarWith(p).length === 0
        return ratingsValid && !interferingEvent && peaceValid
    }
}
