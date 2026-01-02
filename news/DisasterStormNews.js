class DisasterStormNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s storm systems begin to accrete into a massive super-storm, threatening to destroy entire cities!`,
            `${coloredName(planet)} successfully disperses the mega-storm using atmospheric manipulation technology!`,
            `The mega-storm on ${coloredName(planet)} rages unchecked, devastating infrastructure and claiming countless lives!`,
            ``,
            NT.DISASTER_STORM, planet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.damagableBuildings, Math.min(2, this.planet.settlement.damagableBuildings.length), true);

        this.addPlanetEffect(
            {
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.CONSTRUCTION, CL.SLIGHTLY_HIGH], [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH]]))
            },
            {
                technology: CL.HIGH
            },
            {
                buildingsDamaged: buildingsToDisable,
                population: CL.LOW,
                army: CL.LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.LOW,
                reserves: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology (weather control/prediction), navy (atmospheric missions), and wealth
        this.rollOutcome(p.c.technology * p.c.navy * p.c.wealth / p.c.corruption, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Only affects planets with substantial atmosphere
        const climateValid = p.climate.atmosphericPressure && p.climate.atmosphericPressure.value >= ATMOSPHERIC_PRESSURES.MEDIUM.value
        
        // More likely with storm features or high geological activity (energy input)
        const hasStormFeature = p.features && p.features.some(f => f.name.toLowerCase().includes('storm'))
        const highActivity = p.climate.geologicalActivity && p.climate.geologicalActivity.value >= GEOLOGICAL_ACTIVITIES.SLIGHTLY_HIGH.value
        
        const featureValid = hasStormFeature || highActivity
        
        // Needs settlement
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return climateValid && featureValid && settlementValid
    }
}
