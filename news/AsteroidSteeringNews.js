class AsteroidSteeringNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} deploys a network of asteroid-tracking satellites to deflect incoming space rocks!`,
            `${coloredName(planet)}'s asteroid defense network is operational, successfully diverting threats!`,
            `${coloredName(planet)}'s asteroid defense network malfunctions, causing more chaos than protection!`,
            ``,
            NT.ASTEROID_STEERING, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.HIGH,
                wealth: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.ISOTOPES, CL.VERY_HIGH],
                    [CARGO_TYPES.NANITES, CL.HIGH]
                ]))
            },
            {
                technology: CL.HIGH,
                navy: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                wealth: CL.LOW,
                reserves: CL.LOW,
                navy: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                territory: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on navy (satellite operations) and technology
        this.rollOutcome(p.c.navy * p.c.technology / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high navy and tech for space operations
        const ratingsValid = p.c.navy > CL.HIGH 
            && p.c.technology > CL.HIGH
            && p.c.wealth > CL.SLIGHTLY_LOW
        
        // Must have asteroid impact problem
        const asteroidValid = p.features.includes(PLANET_FEATURE_TYPES.ASTEROID_BOMBARDMENT)
        
        return ratingsValid && asteroidValid
    }
}
