class EnvironmentalismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s people are de-industrializing to save their planet's natural beauty!`,
            `${coloredName(planet)} has de-industrialized, giving their planet room to breathe again!`,
            `${coloredName(planet)}'s environmental movement peters out as heavy industry lobbies against it!`,
            ``,
            NT.ENVIRONMENTALISM, planet
        )

        this.addPlanetEffect(
            {
                industry: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.NANITES, CL.EXTREMELY_LOW], [CARGO_TYPES.METAL, CL.EXTREMELY_LOW]])),
            },
            {
                population: CL.SLIGHTLY_HIGH,
                industry: CL.VERY_LOW,
                economy: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                culture: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_HIGH
            }
        )
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.education*this.planet.c.culture/this.planet.c.industry/this.planet.c.corruption)
    }

    isValid() {
        const {planet: p} = this
        //happens when industry is getting out of hand
        const ratingsValid = p.c.industry >= CL.HIGH
        const interferingEvent = News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
