class DisasterFlareNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is hit by a massive coronal mass ejection from its star, frying electronics and disrupting infrastructure!`,
            `${coloredName(planet)}'s shielded infrastructure and magnetic field protect most systems from the solar flare!`,
            `${coloredName(planet)}'s electronics and power grids are devastated by the intense solar radiation!`,
            ``,
            NT.DISASTER_FLARE, planet
        )

        this.addPlanetEffect(
            {
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.ELECTRONICS, CL.HIGH]
                ]))
            },
            {
                technology: CL.SLIGHTLY_LOW
            },
            {
                economy: CL.LOW,
                industry: CL.LOW,
                technology: CL.LOW,
                wealth: CL.LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on magnetosphere (natural protection), technology (shielding), and industry (hardened infrastructure)
        const magnetosphereValue = p.features.includes(PLANET_FEATURE_TYPES.STRONG_MAGNETOSPHERE) ? CL.HIGH : (p.features.includes(PLANET_FEATURE_TYPES.WEAK_MAGNETOSPHERE) || p.features.includes(PLANET_FEATURE_TYPES.NO_MAGNETOSPHERE)) ? CL.LOW : CL.MEDIUM
        this.rollOutcome(magnetosphereValue * p.c.technology * p.c.industry, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Only affects planets close to the star (within 10 AU)
        const orbitValid = p.orbit && p.orbit.radius < 10
        
        // Protected if planet has strong magnetosphere
        const protectedByMagnetosphere = p.features.includes(PLANET_FEATURE_TYPES.STRONG_MAGNETOSPHERE)
        if (protectedByMagnetosphere) return false
        
        // More likely on planets with weaker magnetospheres (less natural protection)
        const weakMagnetosphere = p.features.includes(PLANET_FEATURE_TYPES.WEAK_MAGNETOSPHERE) || p.features.includes(PLANET_FEATURE_TYPES.NO_MAGNETOSPHERE)
        
        // More likely on planets already experiencing high radiation (closer to star, etc.)
        const highRadiation = p.features.includes(PLANET_FEATURE_TYPES.HIGH_RADIATION) || p.features.includes(PLANET_FEATURE_TYPES.RADIATION_BELTS)
        
        // Needs settlement
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return orbitValid && settlementValid
    }
}
