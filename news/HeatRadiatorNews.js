class HeatRadiatorNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} constructs massive heat radiators to vent excess geothermal energy into space!`,
            `${coloredName(planet)}'s heat radiators succeed, stabilizing temperatures and reducing volcanic activity!`,
            `${coloredName(planet)}'s heat radiators malfunction, causing sudden temperature drops and industrial damage!`,
            ``,
            NT.HEAT_RADIATOR, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.LOW,
                reserves: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.METAL, CL.VERY_HIGH],
                    [CARGO_TYPES.NANITES, CL.HIGH],
                    [CARGO_TYPES.ISOTOPES, CL.HIGH]
                ]))
            },
            {
                technology: CL.SLIGHTLY_HIGH,
                industry: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                wealth: CL.VERY_LOW,
                reserves: CL.LOW,
                industry: CL.LOW,
                economy: CL.LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on wealth (expensive project) and industry (construction capacity)
        this.rollOutcome(p.c.wealth * p.c.industry / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high wealth and industry
        const ratingsValid = p.c.wealth > CL.HIGH 
            && p.c.industry > CL.HIGH
            && p.c.technology > CL.MEDIUM
        
        // Must have high heat/geological activity to vent
        const heatValid = (p.climate.temperature && p.climate.temperature.value >= TEMPERATURES.HIGH.value) ||
            (p.climate.geologicalActivity && p.climate.geologicalActivity.value >= GEOLOGICAL_ACTIVITIES.HIGH.value)
        
        return ratingsValid && heatValid
    }
}
