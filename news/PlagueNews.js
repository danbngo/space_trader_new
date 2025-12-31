class PlagueNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is struck by a vicious plague! The population is being decimated!`,
            `${coloredName(planet)} develops a cure for their plague!`,
            `${coloredName(planet)} fails to contain the plague! The death toll is catastrophic!`,
            '',
            NT.PLAGUE, planet
        )

        this.addPlanetEffect(
            {
                population: CL.VERY_LOW,
                education: CL.VERY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.MEDICINE, CL.EXTREMELY_HIGH]
                ]))
            },
            {
                population: CL.SLIGHTLY_LOW,
                education: CL.SLIGHTLY_LOW
            },
            {
                population: CL.NO_REGRESSION,
                education: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.MEDICINE, CL.NO_REGRESSION]
                ]))
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher economy/industry = better medical infrastructure
        const cureProbability = (p.c.economy + p.c.industry) / 2
        this.rollOutcome(cureProbability)
    }

    isValid() {
        const {planet: p} = this
        //happens when population is getting out of hand
        const ratingsValid = p.c.population > CL.MEDIUM

        const interferingEvent = //can happy anytime, anywhere!
            News.hasNews(NT.PLAGUE, planet)

        return ratingsValid && !interferingEvent
    }
}
