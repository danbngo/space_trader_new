class IndustrialAccidentNews extends News {
    constructor(planet = new Planet()) {
        super(
            `A catastrophic industrial accident rocks ${coloredName(planet)}, triggering massive explosions that devastate entire districts!`,
            `${coloredName(planet)} successfully contains the damage through rapid response and technological expertise!`,
            `${coloredName(planet)}'s industrial disaster spirals out of control, causing widespread devastation!`,
            '',
            NT.INDUSTRIAL_ACCIDENT, planet
        )

        this.addPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                reserves: CL.SLIGHTLY_LOW,
            },
            {
                population: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                population: CL.LOW,
                economy: CL.LOW,
                industry: CL.VERY_LOW,
                reserves: CL.LOW,
                wealth: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Can mitigate with technology, taxes (emergency funding), and reserves
        this.rollOutcome(p.c.technology * p.c.taxes * p.c.reserves, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // More likely with very high industry and corruption (poor safety controls)
        const ratingsValid = p.c.industry > CL.VERY_HIGH && p.c.corruption > CL.MEDIUM
        return ratingsValid
    }
}
