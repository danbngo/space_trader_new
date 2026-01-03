class MagneticStormsNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s powerful magnetosphere generates violent magnetic storms that disrupt technology and industry!`,
            `${coloredName(planet)} successfully shields its infrastructure from the magnetic storms through coordinated effort!`,
            `${coloredName(planet)}'s magnetic storms wreak havoc on electronic systems and industrial equipment!`,
            ``,
            NT.MAGNETIC_STORMS, planet
        )

        this.addPlanetEffect(
            {
                technology: CL.LOW,
                industry: CL.LOW,
                economy: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.HIGH],
                    [CARGO_TYPES.METAL, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                technology: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                culture: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH
            },
            {
                technology: CL.VERY_LOW,
                industry: CL.VERY_LOW,
                economy: CL.LOW,
                wealth: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on economy (coordinated shielding efforts)
        this.rollOutcome(p.c.economy * p.c.wealth / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high magnetosphere
        const climateValid = p.climate.magnetosphere && p.climate.magnetosphere.value >= MAGNETOSPHERES.HIGH.value
        
        // Needs settlement with technology
        const settlementValid = p.settlement && p.settlement.settlementType !== null && p.c.technology > CL.SLIGHTLY_LOW
        
        return climateValid && settlementValid
    }
}
