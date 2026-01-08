class IceCapsMeltNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s polar ice caps begin rapidly melting, threatening coastal infrastructure with rising seas!`,
            `${coloredName(planet)} successfully implements coastal defenses and relocates threatened populations!`,
            `${coloredName(planet)}'s coastlines are inundated as melting ice caps flood cities and industrial zones!`,
            ``,
            NT.ICE_CAPS_MELT, planet
        )

        this.addPlanetEffect(
            {
                industry: CL.LOW,
                economy: CL.LOW,
                wealth: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.CONSTRUCTION, CL.VERY_HIGH],
                    [CARGO_TYPES.WATER, CL.LOW]
                ]))
            },
            {
                industry: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.SLIGHTLY_LOW,
                industry: CL.VERY_LOW,
                economy: CL.VERY_LOW,
                wealth: CL.LOW,
                reserves: CL.LOW,
                territory: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on wealth (infrastructure investment) and technology (coastal engineering)
        this.rollOutcome(p.c.wealth * p.c.technology * p.c.reserves / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high temperature and existing ice (not already max ocean coverage)
        const climateValid = p.climate.temperature && 
            p.climate.temperature.value >= TEMPERATURES.HIGH.value &&
            p.climate.oceanCoverage &&
            p.climate.oceanCoverage.value < OCEAN_COVERAGES.VERY_HIGH.value
        
        // Needs settlement and industry to be affected
        const settlementValid = p.settlement && p.settlement.settlementType !== null && p.c.industry > CL.SLIGHTLY_LOW
        
        return climateValid && settlementValid
    }
}
