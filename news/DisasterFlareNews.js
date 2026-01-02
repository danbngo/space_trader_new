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
                technology: CL.SLIGHTLY_LOW
            },
            {
                technology: CL.SLIGHTLY_LOW
            },
            {
                economy: CL.LOW,
                industry: CL.LOW,
                technology: CL.LOW,
                wealth: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on magnetosphere (natural protection), technology (shielding), and industry (hardened infrastructure)
        this.rollOutcome(p.climate.magnetosphere.value * p.c.technology * p.c.industry, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Only affects planets close to the star (within 10 AU)
        const orbitValid = p.orbit && p.orbit.radius < 10
        
        // More likely on planets with weaker magnetospheres (less natural protection)
        const weakMagnetosphere = p.climate.magnetosphere && p.climate.magnetosphere.value < MAGNETOSPHERES.MEDIUM.value
        
        // More likely on planets already experiencing high radiation (closer to star, etc.)
        const highRadiation = p.climate.radiationLevel && p.climate.radiationLevel.value >= RADIATION_LEVELS.SLIGHTLY_HIGH.value
        
        // Needs settlement
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return orbitValid && settlementValid
    }
}
