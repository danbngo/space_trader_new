class DisasterGreenhouseNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Pollution on ${coloredName(planet)} leads to a runaway greenhouse effect, raising temperatures and disrupting the ecosystem!`,
            `${coloredName(planet)} implements aggressive carbon capture and environmental restoration, stabilizing the climate!`,
            `${coloredName(planet)}'s greenhouse effect spirals out of control, rendering large swaths of the planet uninhabitable!`,
            ``,
            NT.DISASTER_GREENHOUSE, planet
        )

        this.addPlanetEffect(
            {
                culture: CL.SLIGHTLY_LOW,
                population: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH], [CARGO_TYPES.WATER, CL.HIGH]]))
            },
            {
                culture: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH
            },
            {
                territory: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                population: CL.SLIGHTLY_LOW,
                economy: CL.VERY_LOW,
                industry: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on wealth/reserves (carbon capture is expensive), technology, and education
        this.rollOutcome(p.c.wealth * p.c.reserves * p.c.technology * p.c.education / (p.c.corruption * p.c.industry), CL.HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Only affects planets with very high industry or already warm temperatures
        const climateValid = (p.c.industry >= CL.HIGH) || (p.climate.temperature && p.climate.temperature.value >= TEMPERATURES.SLIGHTLY_HIGH.value && p.c.industry >= CL.SLIGHTLY_HIGH)
        
        // Needs atmosphere and settlement
        const atmosphereValid = p.climate.atmosphericPressure && p.climate.atmosphericPressure.value > ATMOSPHERIC_PRESSURES.VERY_LOW.value
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        // Requires high pollution levels (greenhouse effect is caused by pollution)
        const pollutionValid = p.climate.pollution && p.climate.pollution.value >= POLLUTION_LEVELS.HIGH.value
        
        return climateValid && atmosphereValid && settlementValid && pollutionValid
    }
}
