class ScientificBreakthroughNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins work on a major scientific project, hoping to uncover new mysteries of the universe!`,
            `${coloredName(planet)} completes their scientific project, allowing their society to make a leap forward!`,
            `${coloredName(planet)}'s scientific project suffers setback after setback, and is terminated!`,
            ``,
            NT.SCIENTIFIC_BREAKTHROUGH, planet
        )

        this.addPlanetEffect(
            {
                wealth: CL.LOW,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, CL.ASTRONOMICAL]]))
            },
            {
                wealth: CL.LOW,
                taxes: CL.HIGH,
                technology: CL.VERY_HIGH,
                army: CL.SLIGHTLY_HIGH,
                navy: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_HIGH,
                education: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                wealth: CL.LOW,
                taxes: CL.HIGH,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome(p.c.technology * p.c.education * p.c.taxes / p.c.corruption, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        const ratingsValid = p.c.wealth > CL.SLIGHTLY_HIGH && p.c.taxes > CL.LOW
        //hard times dont block it, may actually accelerate technological progress
        return ratingsValid
    }
}
