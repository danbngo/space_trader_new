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
                industry: CL.ASTRONOMICAL,
                economy: CL.VERY_HIGH,
                technology: CL.HIGH,
                reserves: CL.HIGH,
                wealth: CL.HIGH,
                territory: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.VERY_LOW],
                    [CARGO_TYPES.METAL, CL.VERY_LOW]
                ]))
            },
            {
                // Failure: Gray goo disaster
                population: CL.VERY_LOW,
                industry: CL.VERY_LOW,
                economy: CL.VERY_LOW,
                territory: CL.LOW,
                reserves: CL.VERY_LOW,
                wealth: CL.VERY_LOW,
                prestige: CL.LOW,
                technology: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.VERY_HIGH],
                    [CARGO_TYPES.WATER, CL.VERY_HIGH],
                    [CARGO_TYPES.METAL, CL.VERY_HIGH]
                ]))
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
        const ratingsValid = p.c.technology > CL.HIGH 
            && p.c.industry > CL.SLIGHTLY_HIGH
            && p.c.wealth > CL.SLIGHTLY_HIGH
        return ratingsValid
    }
}
