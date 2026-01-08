class AtmosphereRestorationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches an ambitious algal terraforming program to rebuild their planetary atmosphere!`,
            `${coloredName(planet)}'s algal processors succeed, enriching the atmosphere with breathable gases!`,
            `${coloredName(planet)}'s algal terraforming project spirals out of control, creating toxic blooms!`,
            ``,
            NT.ATMOSPHERE_RESTORATION, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.SLIGHTLY_LOW,
                reserves: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.ISOTOPES, CL.VERY_HIGH],
                    [CARGO_TYPES.NANITES, CL.HIGH]
                ]))
            },
            {
                economy: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_HIGH,
                technology: CL.HIGH,
                education: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                prestige: CL.HIGH
            },
            {
                population: CL.SLIGHTLY_HIGH, // Reduced from SLIGHTLY_LOW
                wealth: CL.SLIGHTLY_LOW, // Reduced from LOW
                reserves: CL.SLIGHTLY_LOW, // Reduced from LOW
                economy: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
                // Removed permanent cargo price effects - these are temporary only
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on education (managing complex biological systems) and technology
        this.rollOutcome(p.c.education * p.c.technology / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high education and low pollution
        const ratingsValid = p.c.education > CL.HIGH 
            && p.c.wealth > CL.MEDIUM
            && p.c.reserves > CL.SLIGHTLY_LOW
        
        // Must not already have thick atmosphere
        const atmosphereValid = !p.features.includes(PLANET_FEATURE_TYPES.THICK_ATMOSPHERE)
        
        // Pollution must be low for algae to work effectively
        const pollutionValid = !p.features.includes(PLANET_FEATURE_TYPES.HEAVY_POLLUTION)
        
        return ratingsValid && atmosphereValid && pollutionValid
    }
}
