class EugenicsNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} implements a controversial eugenics program to breed a smarter, healthier population!`,
            `${coloredName(planet)}'s eugenics program succeeds, producing a more educated and disciplined population!`,
            `${coloredName(planet)}'s eugenics program, riddled with biases and errors, fails to produce any positive outcomes!`,
            '',
            NT.EUGENICS, planet
        )

        this.addPlanetEffect(
            {
                wealth: CL.LOW,
                culture: CL.LOW,
                population: CL.SLIGHTLY_LOW,
                prestige: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.MEDICINE, CL.LOW]])),
            },
            {
                wealth: CL.LOW,
                culture: CL.LOW,
                population: CL.SLIGHTLY_LOW,
                prestige: CL.LOW,
                education: CL.HIGH,
                army: CL.SLIGHTLY_HIGH,
                crime: CL.LOW,
            },
            {
                wealth: CL.LOW,
                culture: CL.LOW,
                population: CL.SLIGHTLY_LOW,
                prestige: CL.VERY_LOW,
            }
        )
    }

    determineOutcome() {
        // Success based on technology, harder with larger populations
        this.rollOutcome(this.planet.c.technology / this.planet.c.population, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // More likely with high technology and authoritarian government
        const ratingsValid = p.c.technology > CL.HIGH && p.c.prestige > CL.MEDIUM
        return ratingsValid
    }
}
