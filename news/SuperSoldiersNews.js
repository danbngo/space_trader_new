class SuperSoldiersNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} announces a controversial program to create genetically and cybernetically enhanced super soldiers!`,
            `${coloredName(planet)}'s super soldier program succeeds! Enhanced warriors join their military ranks!`,
            `${coloredName(planet)}'s super soldier program fails catastrophically! Enhanced soldiers go berserk, forcing the program's termination!`,
            '',
            NT.SUPER_SOLDIERS, planet
        )

        this.addPlanetEffect(
            {
                prestige: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                taxes: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.NANITES, CL.HIGH], [CARGO_TYPES.MEDICINE, CL.HIGH]])),
            },
            {
                army: CL.VERY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                security: CL.HIGH,
                taxes: CL.HIGH
            },
            {
                culture: CL.VERY_LOW,
                security: CL.VERY_LOW,
                army: CL.SLIGHTLY_LOW,
                prestige: CL.LOW,
            }
        )
   }

    determineOutcome() {
        const {planet: p} = this
        // Technology is key, but some wealth and security help
        this.rollOutcome((p.c.technology * p.c.wealth * p.c.security), CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Low military but high technology
        const ratingsValid = p.c.army < CL.MEDIUM && p.c.technology > CL.HIGH
        // Don't do it during other major military or science events
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(p, NT_ECONOMY_PREVENTING) || 
            News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNewsTargeting(p, NT_ECONOMY_PREVENTING) || 
            News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
