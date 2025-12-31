class EconomicBoomNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} experiences an economic boom! Its citizens are living in a gilded age!`,
            `${coloredName(planet)}'s booming economy normalizes.`,
            `${coloredName(planet)}'s economic bubble bursts! Recession hits!`,
            '',
            NT.ECONOMIC_BOOM, planet
        )

        this.addPlanetEffect(
            {
                planet: this.planet,
                economy: CL.EXTREMELY_HIGH,
                wealth: CL.EXTREMELY_HIGH,
                reserves: CL.VERY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.HOLOCUBES, CL.EXTREMELY_HIGH]])),
            },
            {
                economy: CL.HIGH,
                wealth: CL.EXTREMELY_HIGH,
                reserves: CL.VERY_HIGH,
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
