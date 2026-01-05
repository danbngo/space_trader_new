class RadiationSicknessNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Widespread radiation sickness overwhelms ${coloredName(planet)}'s hospitals as the population suffers from chronic exposure!`,
            `${coloredName(planet)} successfully treats radiation sickness through well-funded medical response!`,
            `${coloredName(planet)}'s medical system collapses under the weight of radiation casualties!`,
            ``,
            NT.RADIATION_SICKNESS, planet
        )

        this.addPlanetEffect(
            {
                population: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.MEDICINE, CL.ASTRONOMICAL]
                ]))
            },
            {
                population: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH,
                education: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.LOW, // Reduced from VERY_LOW
                army: CL.LOW,
                economy: CL.LOW,
                wealth: CL.LOW,
                reserves: CL.LOW, // Reduced from VERY_LOW
                culture: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on reserves (medical supplies) and taxes (funding)
        this.rollOutcome(p.c.reserves * p.c.taxes * p.c.wealth / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high radiation levels
        const climateValid = p.climate.radiationLevel && p.climate.radiationLevel.value >= RADIATION_LEVELS.HIGH.value
        
        // Needs settlement to have population
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return climateValid && settlementValid
    }
}
