class DisasterVolcanoNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins experiencing a series of massive volcanic eruptions, spewing ash and lava across the surface!`,
            `${coloredName(planet)} manages to evacuate affected areas and contain the volcanic damage!`,
            `The volcanic eruptions on ${coloredName(planet)} devastate entire regions, leaving cities buried in ash and lava!`,
            ``,
            NT.DISASTER_VOLCANO, planet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.damagableBuildings, Math.min(3, this.planet.settlement.damagableBuildings.length), true);

        this.addPlanetEffect(
            {
                industry: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH], [CARGO_TYPES.MEDICINE, CL.SLIGHTLY_HIGH]]))
            },
            {
                culture: CL.SLIGHTLY_LOW,
                population: CL.SLIGHTLY_LOW
            },
            {
                buildingsDamaged: buildingsToDisable,
                population: CL.HIGH,
                industry: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_LOW,
                territory: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology (monitoring/prediction), wealth (evacuations), and education (preparation)
        this.rollOutcome(p.c.technology * p.c.wealth * p.c.education / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Only affects planets with high geological activity
        const climateValid = p.climate.geologicalActivity && p.climate.geologicalActivity.value >= GEOLOGICAL_ACTIVITIES.HIGH.value
        
        // Needs settlement
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return climateValid && settlementValid
    }
}
