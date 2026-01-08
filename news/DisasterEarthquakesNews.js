class DisasterEarthquakesNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} succumbs to multiple massive seismic events, threatening to topple infrastructure!`,
            `${coloredName(planet)}'s earthquake-resistant buildings and emergency response save countless lives!`,
            `The earthquakes on ${coloredName(planet)} level entire cities, leaving thousands dead and infrastructure in ruins!`,
            ``,
            NT.DISASTER_EARTHQUAKES, planet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.damagableBuildings, Math.min(4, this.planet.settlement.damagableBuildings.length), true);

        this.addPlanetEffect(
            {
                economy: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.CONSTRUCTION, CL.HIGH], [CARGO_TYPES.MEDICINE, CL.SLIGHTLY_HIGH]]))
            },
            {
                culture: CL.HIGH,
            },
            {
                buildingsDamaged: buildingsToDisable,
                population: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                reserves: CL.SLIGHTLY_LOW,
                wealth: CL.LOW,
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
        const climateValid = p.features.includes(PLANET_FEATURE_TYPES.VOLCANIC_ACTIVITY)
        
        // Needs settlement
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return climateValid && settlementValid
    }
}
