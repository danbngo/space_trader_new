class AntimatterGridNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins construction of an antimatter power grid to revolutionize their energy infrastructure!`,
            `${coloredName(planet)}'s antimatter power grid comes online successfully, providing cheap abundant energy to the entire planet!`,
            `${coloredName(planet)}'s antimatter power grid suffers a catastrophic containment failure! The resulting explosion devastates large areas!`,
            ``,
            NT.ANTIMATTER_GRID, planet
        )

        const buildingsDamaged = rndMembers(planet.settlement.damagableBuildings, Math.min(3, planet.settlement.damagableBuildings.length), true)

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
                buildingsDamaged,
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
        const ratingsValid = p.c.technology > CL.HIGH
            && p.c.security > CL.MEDIUM
            && p.c.wealth > CL.MEDIUM
            && p.c.reserves > CL.SLIGHTLY_LOW
        
        // More challenging in extreme climates (extreme temperatures or high seismic activity increase risk)
        const extremeTemp = p.climate.temperature && (p.climate.temperature.value <= TEMPERATURES.VERY_LOW.value || p.climate.temperature.value >= TEMPERATURES.VERY_HIGH.value)
        const highSeismicActivity = p.climate.geologicalActivity && p.climate.geologicalActivity.value >= GEOLOGICAL_ACTIVITIES.HIGH.value
        
        // Still possible, but make it less likely if climate is hazardous (could fail in determineOutcome)
        // We allow it but note the risk - game designers can decide if we want to block it entirely
        const climateRisky = extremeTemp || highSeismicActivity
        
        return ratingsValid
    }
}
