class AtmosphereStrippedNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s atmosphere is being stripped away by radiation and low gravity, threatening all life!`,
            `${coloredName(planet)} deploys atmospheric generation stations to replenish the vanishing atmosphere!`,
            `${coloredName(planet)}'s atmosphere continues to bleed into space, leaving the surface exposed to deadly conditions!`,
            ``,
            NT.ATMOSPHERE_STRIPPED, planet
        )

        this.addPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                taxes: CL.HIGH,
                climateAlterations: () => {
                    planet.climate.incrementClimateValue(ATMOSPHERIC_PRESSURES, -1)
                },
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.ISOTOPES, CL.ASTRONOMICAL],
                    [CARGO_TYPES.WATER, CL.VERY_HIGH]
                ]))
            },
            {
                population: CL.SLIGHTLY_LOW,
                technology: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                climateAlterations: () => {
                    planet.climate.incrementClimateValue(ATMOSPHERIC_PRESSURES, -1)
                }
            },
            {
                population: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                economy: CL.LOW,
                wealth: CL.LOW,
                reserves: CL.LOW,
                culture: CL.SLIGHTLY_LOW,
                climateAlterations: () => {
                    planet.climate.incrementClimateValue(ATMOSPHERIC_PRESSURES, -2)
                }
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology (atmospheric generators) and wealth/reserves (resource intensive)
        this.rollOutcome(p.c.technology * p.c.wealth * p.c.reserves / p.c.corruption, CL.HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires high radiation OR low gravity, and existing atmosphere
        const highRadiation = p.climate.radiationLevel && p.climate.radiationLevel.value >= RADIATION_LEVELS.HIGH.value
        const lowGravity = p.climate.gravity && p.climate.gravity.value <= GRAVITIES.LOW.value
        const hasAtmosphere = p.climate.atmosphericPressure && p.climate.atmosphericPressure.value > ATMOSPHERIC_PRESSURES.VERY_LOW.value
        
        const climateValid = (highRadiation || lowGravity) && hasAtmosphere
        
        // Needs settlement
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return climateValid && settlementValid
    }
}
