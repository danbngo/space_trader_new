class GlobalCoolingNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Volcanic winter descends upon ${coloredName(planet)} as ash clouds block out the sun, plunging temperatures!`,
            `${coloredName(planet)}'s population survives underground while technology clears the ash-choked skies!`,
            `${coloredName(planet)} freezes as volcanic winter devastates the surface, destroying infrastructure and crops!`,
            ``,
            NT.GLOBAL_COOLING, planet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.damagableBuildings, 1, true);

        this.addPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW,
                economy: CL.LOW,
                wealth: CL.SLIGHTLY_LOW,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.VERY_HIGH],
                    [CARGO_TYPES.ISOTOPES, CL.HIGH]
                ]))
            },
            {
                population: CL.SLIGHTLY_LOW,
                culture: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH
            },
            {
                buildingsDamaged: buildingsToDisable,
                population: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                economy: CL.VERY_LOW,
                industry: CL.LOW,
                wealth: CL.LOW,
                reserves: CL.LOW,
                territory: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on reserves (supplies to survive underground) and technology (climate engineering)
        this.rollOutcome(p.c.reserves * p.c.technology * p.c.wealth / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high geological activity (volcanic eruptions) or recent disasters
        const climateValid = p.climate.geologicalActivity && 
            p.climate.geologicalActivity.value >= GEOLOGICAL_ACTIVITIES.VERY_HIGH.value
        
        // Needs atmosphere and settlement
        const atmosphereValid = p.climate.atmosphericPressure && 
            p.climate.atmosphericPressure.value >= ATMOSPHERIC_PRESSURES.MEDIUM.value
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return climateValid && atmosphereValid && settlementValid
    }
}
