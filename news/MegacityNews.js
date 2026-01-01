class MegacityNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} announces plans to construct a massive new megacity to accommodate population growth!`,
            `${coloredName(planet)}'s new megacity is completed! Millions flock to the gleaming towers and bustling districts!`,
            `${coloredName(planet)}'s megacity project devolves into a crime-ridden slum of poor planning and corruption!`,
            ``,
            NT.MEGACITY, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                inflation: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.METAL, CL.VERY_HIGH],
                    [CARGO_TYPES.NANITES, CL.HIGH],
                    [CARGO_TYPES.FOOD, CL.HIGH]
                ]))
            },
            {
                population: CL.HIGH,
                economy: CL.HIGH,
                wealth: CL.HIGH,
                taxes: CL.LOW,
                inflation: CL.LOW,
                industry: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                crime: CL.VERY_HIGH,
                corruption: CL.HIGH,
                security: CL.LOW,
                wealth: CL.LOW,
                taxes: CL.VERY_HIGH,
                inflation: CL.VERY_HIGH,
                prestige: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.DRUGS, CL.VERY_HIGH],
                    [CARGO_TYPES.WEAPONS, CL.HIGH]
                ]))
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on planning (education), resources, and lack of crime/corruption
        this.rollOutcome(p.c.economy * p.c.education * p.c.security / (p.c.corruption * p.c.crime), CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires growing population pressure and resources
        const ratingsValid = p.c.population > CL.SLIGHTLY_HIGH
            && p.c.economy > CL.MEDIUM
            && p.c.wealth > CL.MEDIUM
            && p.c.reserves > CL.SLIGHTLY_LOW
        return ratingsValid
    }
}
