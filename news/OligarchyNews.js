class OligarchyNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s economy and government are falling into the grip of powerful oligarchs!`,
            `${coloredName(planet)}'s oligarchs lose their grip on power as the masses rise up!`,
            `${coloredName(planet)}'s oligarchs consolidate their insidious control over society!`,
            ``,
            NT.OLIGARCHY, planet
        )

        this.addPlanetEffect(
            {
                corruption: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,
                taxes: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH],
                    [CARGO_TYPES.MEDICINE, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                corruption: CL.LOW,
                wealth: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH
            },
            {
                corruption: CL.HIGH,
                economy: CL.SLIGHTLY_LOW,
                wealth: CL.LOW,
                taxes: CL.EXTREMELY_LOW,
                culture: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome(p.c.culture*p.c.education*p.c.population/p.c.corruption/p.c.economy, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // More likely if wealth is high 
        const ratingsValid = (p.c.wealth > CL.HIGH && p.c.corruption > CL.VERY_LOW)
        const interferingEvent = News.planetHasAnyNews(p, [...NT_GOVERNANCE_PREVENTING, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
