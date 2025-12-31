class FestivalNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} announces an extravagant festival open to all visitors, diverting resources to celebrate!`,
            `${coloredName(planet)}'s festival concludes, leaving the planet with enhanced prestige!`,
            `${coloredName(planet)}'s festival is marred by violence and disasters!`,
            ``,
            NT.FESTIVAL, planet
        )

        this.addPlanetEffect(
            {
                wealth: CL.LOW,
                crime: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH], [CARGO_TYPES.DRUGS, CL.ASTRONOMICAL]])),
            },
            {
                crime: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                wealth: CL.LOW,
                crime: CL.HIGH,
                prestige: CL.LOW,
            }
        )
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.security)
    }

    isValid() {
        const {planet: p} = this
        //need high credits to afford it, low prestige to want it
        const ratingsValid = p.c.wealth > CL.SLIGHTLY_HIGH && p.c.prestige < CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(p, [...NT_ECONOMY_PREVENTING, ...NT_DANGEROUS])
        return ratingsValid && !interferingEvent
    }
}
