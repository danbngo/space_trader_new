class ColonyShipNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} announces an ambitious project to construct a generation ship to reach another star system!`,
            `${coloredName(planet)} successfully launches their colony ship! Though it will take centuries to reach its destination, the technological achievements inspire the entire planet!`,
            `${coloredName(planet)}'s colony ship project encounters insurmountable technical challenges and is cancelled!`,
            ``,
            NT.COLONY_SHIP, planet
        )

        this.addPlanetEffect(
            {
                reserves: CL.LOW,
                wealth: CL.LOW,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.ASTRONOMICAL],
                    [CARGO_TYPES.ISOTOPES, CL.VERY_HIGH]
                ]))
            },
            {
                reserves: CL.LOW,
                wealth: CL.LOW,
                taxes: CL.HIGH,
                technology: CL.VERY_HIGH,
                education: CL.HIGH,
                prestige: CL.VERY_HIGH,
                industry: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH
            },
            {
                reserves: CL.VERY_LOW,
                wealth: CL.VERY_LOW,
                taxes: CL.HIGH,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology, education, industry, and available resources
        this.rollOutcome(p.c.technology * p.c.education * p.c.industry * p.c.reserves / p.c.corruption, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires very high tech, education, and sufficient resources
        const ratingsValid = p.c.technology > CL.HIGH 
            && p.c.education > CL.SLIGHTLY_HIGH 
            && p.c.wealth > CL.MEDIUM 
            && p.c.reserves > CL.SLIGHTLY_LOW
            && p.c.industry > CL.MEDIUM
        return ratingsValid
    }
}
