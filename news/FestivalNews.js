class FestivalNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} announces an extravagant festival open to all visitors, diverting resources to celebrate!`,
            `${coloredName(planet)}'s festival concludes, leaving the planet with enhanced prestige!`,
            `${coloredName(planet)}'s festival is marred by local protests and security incidents!`,
            ``,
            NT.FESTIVAL, planet
        )

        this.addPlanetEffect(
            {
                wealth: CL.LOW,
                crime: CL.HIGH,
                taxes: CL.HIGH,
                security: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH], [CARGO_TYPES.DRUGS, CL.ASTRONOMICAL]])),
            },
            {
                wealth: CL.SLIGHTLY_LOW,
                taxes: CL.SLIGHTLY_HIGH,
                culture: CL.HIGH,
                prestige: CL.HIGH,
            },
            {
                wealth: CL.SLIGHTLY_LOW,
                taxes: CL.SLIGHTLY_HIGH,
            }
        )
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.security*this.planet.c.culture, CL.LOW)
    }

    shouldCancel() {
        const {planet: p} = this
        // Festival cancelled if any dangerous event threatens the planet
        return News.planetHasAnyNews(p, NT_DANGEROUS)
    }

    isValid() {
        const {planet: p} = this
        //need high credits to afford it, low prestige to want it
        const ratingsValid = p.c.wealth > CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(p, [...NT_ECONOMY_PREVENTING, ...NT_DANGEROUS])
        return ratingsValid && !interferingEvent
    }
}
