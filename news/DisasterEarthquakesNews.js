class DisasterEarthquakesNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} succumbs to multiple massive seismic events, threatening to topple infrastructure!`,
            `${coloredName(planet)}'s earthquake-resistant buildings and emergency response save countless lives!`,
            `The earthquakes on ${coloredName(planet)} level entire cities, leaving thousands dead and infrastructure in ruins!`,
            ``,
            NT.DISASTER_EARTHQUAKES, planet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.destroyableBuildings, Math.min(4, this.planet.settlement.destroyableBuildings.length), true);

        this.addPlanetEffect(
            {
                economy: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.CONSTRUCTION, CL.HIGH], [CARGO_TYPES.MEDICINE, CL.SLIGHTLY_HIGH]]))
            },
            {
                economy: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW
            },
            {
                buildingsDisabled: buildingsToDisable,
                population: CL.SLIGHTLY_HIGH,
                economy: CL.HIGH,
                security: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology (seismic engineering), education (building codes), and wealth (quality construction)
        this.rollOutcome(p.c.technology * p.c.education * p.c.wealth / p.c.corruption, CL.MEDIUM)
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
