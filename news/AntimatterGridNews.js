class AntimatterGridNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins construction of an antimatter power grid to revolutionize their energy infrastructure!`,
            `${coloredName(planet)}'s antimatter power grid comes online successfully, providing cheap abundant energy to the entire planet!`,
            `${coloredName(planet)}'s antimatter power grid suffers a catastrophic containment failure! The resulting explosion devastates large areas!`,
            ``,
            NT.ANTIMATTER_GRID, planet
        )

        const buildingsDisabled = rndMembers(planet.settlement.destroyableBuildings, Math.min(3, planet.settlement.destroyableBuildings.length), true)

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                inflation: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.ANTIMATTER, CL.ASTRONOMICAL],
                    [CARGO_TYPES.ISOTOPES, CL.VERY_HIGH],
                    [CARGO_TYPES.NANITES, CL.HIGH]
                ]))
            },
            {
                industry: CL.VERY_HIGH,
                economy: CL.HIGH,
                wealth: CL.HIGH,
                taxes: CL.LOW,
                inflation: CL.LOW,
                technology: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.ANTIMATTER, CL.VERY_LOW]
                ]))
            },
            {
                buildingsDisabled,
                population: CL.VERY_LOW,
                industry: CL.VERY_LOW,
                economy: CL.LOW,
                wealth: CL.VERY_LOW,
                reserves: CL.VERY_LOW,
                technology: CL.LOW,
                taxes: CL.VERY_HIGH,
                prestige: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH],
                    [CARGO_TYPES.MEDICINE, CL.VERY_HIGH],
                    [CARGO_TYPES.FOOD, CL.VERY_HIGH]
                ]))
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology, safety protocols (security), and lack of corruption
        this.rollOutcome(p.c.technology * p.c.security * p.c.education / (p.c.corruption * p.c.corruption), CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires very high tech and good safety standards
        const ratingsValid = p.c.technology > CL.VERY_HIGH
            && p.c.security > CL.SLIGHTLY_HIGH
            && p.c.wealth > CL.SLIGHTLY_HIGH
            && p.c.reserves > CL.SLIGHTLY_HIGH
        return ratingsValid
    }
}
