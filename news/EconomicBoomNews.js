class EconomicBoomNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} experiences an economic boom! Its citizens are living in a gilded age!`,
            `${coloredName(planet)}'s booming economy normalizes.`,
            `${coloredName(planet)}'s economic bubble bursts! Recession hits!`,
            '',
            NT.ECONOMIC_BOOM, planet
        )

        const buildingsImproved = rndMembers(planet.settlement.improvableBuildings, rng(3,1), true);

        this.addPlanetEffect(
            {
                economy: CL.EXTREMELY_HIGH,
                wealth: CL.EXTREMELY_HIGH,
                reserves: CL.VERY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.HOLOCUBES, CL.HIGH]])),
                taxes: CL.LOW,
            },
            {
                buildingsImproved,
                economy: CL.SLIGHTLY_HIGH, // Reduced from HIGH
                wealth: CL.HIGH, // Reduced from EXTREMELY_HIGH
                reserves: CL.HIGH, // Reduced from VERY_HIGH
                taxes: CL.VERY_LOW // Reduced from EXTREMELY_LOW
            },
            {
                wealth: CL.LOW,
                crime: CL.HIGH
            }
        )
    }

    determineOutcome() {
        this.rollOutcome((this.planet.c.industry + this.planet.c.economy) / 2, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        //cant already having a booming economy
        const ratingsValid = p.c.economy < CL.VERY_HIGH && p.c.wealth < CL.VERY_HIGH
        //basically just a bonus for not being in a war or anything stupid
        const interferingEvent = 
            News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNewsTargeting(p, [...NT_DANGEROUS, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
