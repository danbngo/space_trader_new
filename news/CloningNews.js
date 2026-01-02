class CloningNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches an ambitious cloning program to rapidly boost its population through vat-grown citizens!`,
            `${coloredName(planet)}'s cloning program succeeds, creating a new generation of healthy citizens!`,
            `${coloredName(planet)}'s cloning program backfires as genetic defects plague the new population!`,
            '',
            NT.CLONING, planet
        )

        this.addPlanetEffect(
            {
                population: CL.HIGH,
                technology: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, CL.VERY_HIGH]])),
            },
            {
                population: CL.VERY_HIGH,
                army: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                prestige: CL.LOW,
            },
            {
                population: CL.SLIGHTLY_HIGH,
                army: CL.SLIGHTLY_LOW,
                prestige: CL.VERY_LOW,
                education: CL.LOW,
                wealth: CL.LOW,
                taxes: CL.HIGH,
            }
        )
    }

    determineOutcome() {
        // Success based on technology and education
        this.rollOutcome(this.planet.c.technology * this.planet.c.education, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // More likely when population is low and technology is reasonably high
        const ratingsValid = p.c.population < CL.LOW && (p.c.technology > CL.SLIGHTLY_HIGH || p.c.education > CL.SLIGHTLY_HIGH)
        return ratingsValid
    }
}
