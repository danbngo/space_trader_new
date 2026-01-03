class GravityCollapseNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s intense gravity causes catastrophic structural failures across the planet!`,
            `${coloredName(planet)} mobilizes emergency repair crews to shore up collapsing infrastructure!`,
            `${coloredName(planet)}'s buildings and industrial complexes collapse under the crushing gravity!`,
            ``,
            NT.GRAVITY_COLLAPSE, planet
        )

        this.addPlanetEffect(
            {
                industry: CL.LOW,
                technology: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.METAL, CL.VERY_HIGH],
                    [CARGO_TYPES.CONSTRUCTION, CL.ASTRONOMICAL]
                ]))
            },
            {
                industry: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW,
                culture: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                army: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
                industry: CL.VERY_LOW,
                technology: CL.LOW,
                economy: CL.LOW,
                wealth: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on army (manpower for repairs) and economy (resources)
        this.rollOutcome(p.c.army * p.c.economy * p.c.wealth / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires very high gravity
        const climateValid = p.climate.gravity && p.climate.gravity.value >= GRAVITIES.VERY_HIGH.value
        
        // Needs industrial infrastructure
        const settlementValid = p.settlement && p.settlement.settlementType !== null && p.c.industry > CL.SLIGHTLY_LOW
        
        return climateValid && settlementValid
    }
}
