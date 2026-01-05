class AdvancedNanitesNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} announces a breakthrough in nanite technology, promising revolutionary improvements to their industrial capacity!`,
            `${coloredName(planet)}'s advanced nanites exceed all expectations, dramatically boosting industrial output and economic prosperity!`,
            `${coloredName(planet)}'s advanced nanites malfunction catastrophically, triggering a gray goo scenario! Emergency protocols contain the swarm, but not before massive damage is done!`,
            ``,
            NT.ADVANCED_NANITES, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.HIGH,
                wealth: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.ASTRONOMICAL],
                    [CARGO_TYPES.ISOTOPES, CL.HIGH]
                ]))
            },
            {
                // Success: Industrial revolution
                industry: CL.VERY_HIGH, // Reduced from ASTRONOMICAL
                economy: CL.HIGH, // Reduced from VERY_HIGH
                technology: CL.SLIGHTLY_HIGH, // Reduced from HIGH
                reserves: CL.SLIGHTLY_HIGH, // Reduced from HIGH
                wealth: CL.SLIGHTLY_HIGH, // Reduced from HIGH
                territory: CL.SLIGHTLY_HIGH
            },
            {
                // Failure: Gray goo disaster
                population: CL.LOW, // Reduced from VERY_LOW
                army: CL.LOW, // Reduced from VERY_LOW
                industry: CL.LOW, // Reduced from VERY_LOW
                economy: CL.LOW, // Reduced from VERY_LOW
                territory: CL.LOW,
                reserves: CL.LOW, // Reduced from VERY_LOW
                wealth: CL.LOW, // Reduced from VERY_LOW
                prestige: CL.LOW,
                technology: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology, industry, and safety protocols (security)
        this.rollOutcome(p.c.technology * p.c.industry * p.c.security / p.c.corruption, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires high tech and existing industrial capacity
        const ratingsValid = p.c.technology > CL.MEDIUM 
            && p.c.industry > CL.MEDIUM
            && p.c.wealth > CL.MEDIUM
        return ratingsValid
    }
}
