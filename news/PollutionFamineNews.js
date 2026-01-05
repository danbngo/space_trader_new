class PollutionFamineNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Toxic pollution renders ${coloredName(planet)}'s harvests inedible, triggering widespread famine!`,
            `${coloredName(planet)} successfully imports food from trading partners, averting famine!`,
            `${coloredName(planet)}'s population starves as toxic pollution destroys food supplies!`,
            ``,
            NT.POLLUTION_FAMINE, planet
        )

        this.addPlanetEffect(
            {
                population: CL.LOW,
                economy: CL.LOW,
                wealth: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.ASTRONOMICAL],
                    [CARGO_TYPES.WATER, CL.VERY_HIGH]
                ]))
            },
            {
                population: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                prestige: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
                commerce: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.LOW, // Reduced from VERY_LOW
                army: CL.LOW,
                economy: CL.LOW, // Reduced from VERY_LOW
                wealth: CL.LOW,
                reserves: CL.LOW,
                culture: CL.LOW,
                crime: CL.SLIGHTLY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on economy (trade capacity) and prestige (international goodwill)
        this.rollOutcome(p.c.economy * p.c.prestige * p.c.economy / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires very high pollution
        const climateValid = p.climate.pollution && p.climate.pollution.value >= POLLUTION_LEVELS.VERY_HIGH.value
        
        // Needs population
        const settlementValid = p.settlement && p.settlement.settlementType !== null && p.c.population > CL.SLIGHTLY_LOW
        
        return climateValid && settlementValid
    }
}
