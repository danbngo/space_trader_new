class SpaceElevatorNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins construction of a space elevator to connect with its orbital moons!`,
            `${coloredName(planet)}'s space elevator is completed! Cargo and materials flow efficiently between surface and orbit!`,
            `${coloredName(planet)}'s space elevator collapses catastrophically, with debris raining down on the surface!`,
            ``,
            NT.SPACE_ELEVATOR, planet
        )

        const buildingsDamaged = rndMembers(planet.settlement.damagableBuildings, Math.min(3, planet.settlement.damagableBuildings.length), true)

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.METAL, CL.ASTRONOMICAL],
                    [CARGO_TYPES.NANITES, CL.VERY_HIGH]
                ]))
            },
            {
                industry: CL.HIGH,
                economy: CL.HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                taxes: CL.SLIGHTLY_HIGH
            },
            {
                buildingsDamaged,
                population: CL.LOW,
                army: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                wealth: CL.VERY_LOW,
                reserves: CL.VERY_LOW,
                taxes: CL.VERY_HIGH,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology, industry, engineering capacity
        this.rollOutcome(p.c.technology * p.c.industry * p.c.education / p.c.corruption, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        
        // Space elevator requires stable climate - no extreme seismic activity or extreme weather
        const seismicStability = !p.features.includes(PLANET_FEATURE_TYPES.VOLCANIC_ACTIVITY)
        const weatherStability = !p.features.includes(PLANET_FEATURE_TYPES.EXTREMELY_HOT) && !p.features.includes(PLANET_FEATURE_TYPES.EXTREMELY_COLD)
        const climateStable = seismicStability && weatherStability
        
        if (!climateStable) return false
        
        // Must have at least one moon
        const hasMoons = p.children && p.children.length > 0
        // Requires high tech and industry
        const ratingsValid = p.c.technology > CL.MEDIUM
            && p.c.industry > CL.MEDIUM
            && p.c.wealth > CL.MEDIUM
            && p.c.reserves > CL.SLIGHTLY_LOW
        return hasMoons && ratingsValid
    }
}
