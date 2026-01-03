class PollutionCleanupNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} mobilizes its population in a massive campaign to clean up environmental damage!`,
            `${coloredName(planet)}'s cleanup campaign succeeds, restoring natural beauty and improving quality of life!`,
            `${coloredName(planet)}'s cleanup campaign fails as corruption diverts resources and efforts stall!`,
            ``,
            NT.POLLUTION_CLEANUP, planet
        )

        this.addPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.HIGH],
                    [CARGO_TYPES.ISOTOPES, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                economy: CL.HIGH,
                culture: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                climateAlterations: () => {
                    // Successfully reduce pollution
                    planet.climate.incrementClimateValue(POLLUTION_LEVELS, -1)
                }
            },
            {
                wealth: CL.LOW,
                reserves: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on population (manpower) and army (discipline) vs corruption
        this.rollOutcome(p.c.population * p.c.army / (p.c.corruption * p.c.corruption), CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires manpower and willingness to mobilize population
        const ratingsValid = p.c.population > CL.MEDIUM 
            && p.c.army > CL.SLIGHTLY_LOW
            && p.c.taxes > CL.SLIGHTLY_LOW
        
        // Must actually have pollution to clean
        const pollutionValid = p.climate.pollution && 
            p.climate.pollution.value >= POLLUTION_LEVELS.SLIGHTLY_HIGH.value
        
        return ratingsValid && pollutionValid
    }
}
