class OceanRestorationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins a massive project to harvest ice asteroids and create new oceans!`,
            `${coloredName(planet)}'s ocean restoration succeeds, with new seas transforming the landscape!`,
            `${coloredName(planet)}'s asteroid harvesting fails catastrophically as an ice asteroid crashes uncontrolled!`,
            ``,
            NT.OCEAN_RESTORATION, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.LOW,
                reserves: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WATER, CL.ASTRONOMICAL],
                    [CARGO_TYPES.ISOTOPES, CL.VERY_HIGH]
                ]))
            },
            {
                economy: CL.HIGH,
                industry: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                territory: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                prestige: CL.HIGH
            },
            {
                population: CL.LOW,
                territory: CL.LOW,
                wealth: CL.LOW, // Reduced from VERY_LOW
                reserves: CL.LOW, // Reduced from VERY_LOW
                industry: CL.SLIGHTLY_LOW,
                prestige: CL.LOW
                // Removed permanent cargo price effects - these are temporary only
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on economy (resources), technology, and navy (asteroid operations)
        this.rollOutcome(p.c.economy * p.c.technology * p.c.navy / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires economic strength and high tax rate to fund expensive project
        const ratingsValid = p.c.economy > CL.MEDIUM 
            && p.c.taxes > CL.HIGH
            && p.c.wealth > CL.SLIGHTLY_LOW
        
        // Must have below average ocean levels (dry world or no ocean world feature)
        const oceanValid = p.features.includes(PLANET_FEATURE_TYPES.DRY_WORLD) || !p.features.includes(PLANET_FEATURE_TYPES.OCEAN_WORLD)
        
        return ratingsValid && oceanValid
    }
}
