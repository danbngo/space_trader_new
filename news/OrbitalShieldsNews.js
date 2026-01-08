class OrbitalShieldsNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins construction of an orbital magnetosphere generator to shield against cosmic radiation!`,
            `${coloredName(planet)}'s orbital shields activate successfully, creating a protective magnetic barrier!`,
            `${coloredName(planet)}'s orbital shield project fails as the generator explodes during activation!`,
            ``,
            NT.ORBITAL_SHIELDS, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.LOW,
                reserves: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.ANTIMATTER, CL.ASTRONOMICAL],
                    [CARGO_TYPES.ISOTOPES, CL.VERY_HIGH],
                    [CARGO_TYPES.NANITES, CL.HIGH]
                ]))
            },
            {
                technology: CL.VERY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_HIGH,
                prestige: CL.HIGH
            },
            {
                population: CL.SLIGHTLY_LOW,
                wealth: CL.VERY_LOW,
                reserves: CL.VERY_LOW,
                technology: CL.SLIGHTLY_LOW,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on very high technology and engineering capacity
        this.rollOutcome(p.c.technology * p.c.education * p.c.industry / p.c.corruption, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires very high tech to build magnetosphere generator
        const ratingsValid = p.c.technology > CL.VERY_HIGH 
            && p.c.education > CL.HIGH
            && p.c.wealth > CL.MEDIUM
            && p.c.reserves > CL.SLIGHTLY_LOW
        
        // Must have radiation problem to solve
        const radiationValid = p.features.includes(PLANET_FEATURE_TYPES.HIGH_RADIATION) || p.features.includes(PLANET_FEATURE_TYPES.RADIATION_BELTS)
        
        return ratingsValid && radiationValid
    }
}
