class GravityHealthNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s microgravity causes severe health deterioration in the population, requiring genetic modifications!`,
            `${coloredName(planet)} successfully implements genetic treatments to adapt the population to low gravity!`,
            `${coloredName(planet)}'s population suffers widespread health collapse from microgravity exposure!`,
            ``,
            NT.GRAVITY_HEALTH, planet
        )

        this.addPlanetEffect(
            {
                population: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                taxes: CL.VERY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.MEDICINE, CL.ASTRONOMICAL],
                    [CARGO_TYPES.ISOTOPES, CL.VERY_HIGH]
                ]))
            },
            {
                population: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
                education: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.LOW, // Reduced from VERY_LOW
                army: CL.LOW,
                economy: CL.LOW,
                wealth: CL.LOW,
                reserves: CL.LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on education (genetic engineering expertise) and taxes (funding)
        this.rollOutcome(p.c.education * p.c.taxes * p.c.technology / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires very low gravity
        const climateValid = p.climate.gravity && p.climate.gravity.value <= GRAVITIES.VERY_LOW.value
        
        // Needs population with some technology
        const settlementValid = p.settlement && p.settlement.settlementType !== null && p.c.technology > CL.SLIGHTLY_LOW
        
        return climateValid && settlementValid
    }
}
