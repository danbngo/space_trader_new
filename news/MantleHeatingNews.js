class MantleHeatingNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} initiates a controversial plan to restart geological processes by detonating deep-core explosives!`,
            `${coloredName(planet)}'s mantle heating succeeds! Tectonic activity resumes and the magnetic field strengthens!`,
            `${coloredName(planet)}'s mantle heating backfires catastrophically, triggering massive quakes and volcanic eruptions!`,
            ``,
            NT.MANTLE_HEATING, planet
        )

        const buildingsDamaged = rndMembers(planet.settlement.damagableBuildings, Math.min(2, planet.settlement.damagableBuildings.length), true)

        this.addPlanetEffect(
            {
                taxes: CL.ASTRONOMICAL,
                wealth: CL.VERY_LOW,
                reserves: CL.VERY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.ANTIMATTER, CL.ASTRONOMICAL],
                    [CARGO_TYPES.ISOTOPES, CL.ASTRONOMICAL]
                ]))
            },
            {
                technology: CL.HIGH,
                industry: CL.SLIGHTLY_HIGH,
                prestige: CL.HIGH
            },
            {
                buildingsDamaged,
                population: CL.LOW,
                territory: CL.LOW,
                wealth: CL.EXTREMELY_LOW,
                reserves: CL.EXTREMELY_LOW,
                industry: CL.LOW,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology and wealth (resources for such a massive undertaking)
        this.rollOutcome(p.c.technology * p.c.wealth * p.c.reserves / p.c.corruption, CL.HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires massive wealth and reserves for deep-core operations
        const ratingsValid = p.c.wealth > CL.VERY_HIGH 
            && p.c.reserves > CL.HIGH
            && p.c.technology > CL.HIGH
        
        // Don't do it if geological activity or magnetosphere is already at dangerous levels
        const geologyValid = p.climate.geologicalActivity && 
            p.climate.geologicalActivity.value < GEOLOGICAL_ACTIVITIES.HIGH.value
        const magnetosphereNotDangerous = !p.climate.magnetosphere || 
            p.climate.magnetosphere.value < MAGNETOSPHERES.VERY_HIGH.value
        
        // Only worth doing if geology is low (dead planet)
        const worthDoing = p.climate.geologicalActivity && 
            p.climate.geologicalActivity.value <= GEOLOGICAL_ACTIVITIES.SLIGHTLY_LOW.value
        
        return ratingsValid && geologyValid && magnetosphereNotDangerous && worthDoing
    }
}
