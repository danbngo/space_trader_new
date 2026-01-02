class DisasterTsunamiNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s oceans produce a massive tsunami which sweeps towards coastal civilizations!`,
            `${coloredName(planet)}'s early warning systems and emergency response save most of the population from the tsunami!`,
            `The tsunami crashes into ${coloredName(planet)}'s coastlines, drowning cities and leaving destruction in its wake!`,
            ``,
            NT.DISASTER_TSUNAMI, planet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.damagableBuildings, Math.min(3, this.planet.settlement.damagableBuildings.length), true);

        this.addPlanetEffect(
            {
                economy: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH], [CARGO_TYPES.MEDICINE, CL.SLIGHTLY_HIGH], [CARGO_TYPES.CONSTRUCTION, CL.SLIGHTLY_HIGH]]))
            },
            {
                population: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW
            },
            {
                buildingsDamaged: buildingsToDisable,
                population: CL.VERY_HIGH,
                economy: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
                reserves: CL.HIGH,
                wealth: CL.SLIGHTLY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology (early warning, seawalls), wealth (infrastructure), and education (preparedness)
        this.rollOutcome(p.c.technology * p.c.wealth * p.c.education / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Only affects planets with high ocean coverage
        const climateValid = p.climate.oceanCoverage && p.climate.oceanCoverage.value >= OCEAN_COVERAGES.HIGH.value
        
        // Can be triggered by geological activity (underwater quakes) or asteroid impacts
        const hasGeologicalActivity = p.climate.geologicalActivity && p.climate.geologicalActivity.value >= GEOLOGICAL_ACTIVITIES.SLIGHTLY_HIGH.value
        const hasAsteroidRisk = p.climate.asteroidImpact && p.climate.asteroidImpact.value >= ASTEROID_IMPACTS.MEDIUM.value
        
        const triggerValid = hasGeologicalActivity || hasAsteroidRisk
        
        // Needs settlement
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return climateValid && triggerValid && settlementValid
    }
}
