class OceanEvaporationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s thin atmosphere allows its oceans to bleed away into space!`,
            `${coloredName(planet)} constructs massive atmospheric processors to recapture evaporating water vapor!`,
            `${coloredName(planet)}'s oceans continue to evaporate, leaving behind vast salt flats and dust bowls!`,
            ``,
            NT.OCEAN_EVAPORATION, planet
        )

        this.addPlanetEffect(
            {
                economy: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,

                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WATER, CL.ASTRONOMICAL],
                    [CARGO_TYPES.FOOD, CL.HIGH]
                ]))
            },
            {
                economy: CL.SLIGHTLY_LOW,
                technology: CL.HIGH,
                education: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.LOW,
                economy: CL.LOW,
                wealth: CL.LOW,
                reserves: CL.SLIGHTLY_LOW,
                territory: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology (atmospheric processors) and wealth (massive construction)
        this.rollOutcome(p.c.technology * p.c.wealth * p.c.industry / p.c.corruption, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires low atmospheric pressure and existing oceans
        const climateValid = p.climate.atmosphericPressure && 
            p.climate.atmosphericPressure.value <= ATMOSPHERIC_PRESSURES.LOW.value &&
            p.climate.oceanCoverage &&
            p.climate.oceanCoverage.value > OCEAN_COVERAGES.VERY_LOW.value
        
        // Needs settlement
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return climateValid && settlementValid
    }
}
