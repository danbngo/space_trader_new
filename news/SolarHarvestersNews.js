class SolarHarvestersNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches massive orbital platforms to gather solar energy and transmit it back to the surface!`,
            `${coloredName(planet)}'s solar harvesters succeed in alleviating their energy needs, allowing them to beautify their planet and reduce pollution!`,
            `${coloredName(planet)}'s solar harvester platforms break apart in orbit, leaving harmful debris in their wake!`,
            ``,
            NT.SOLAR_HARVESTERS, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.HIGH,
                navy: CL.SLIGHTLY_LOW
            },
            {
                culture: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_HIGH
            },
            {
                navy: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology, industry, and wealth to maintain the platforms
        this.rollOutcome(p.c.technology * p.c.industry * p.c.wealth / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires technology and industry
        const ratingsValid = p.c.technology > CL.SLIGHTLY_HIGH && p.c.industry > CL.SLIGHTLY_LOW
        
        // Can't have multiple mega infrastructure projects
        const interferingEvent = News.planetHasAnyNews(p, [NT.SOLAR_HARVESTERS, NT.SPACE_ELEVATOR, NT.PLANETARY_DEFENSE, NT.ANTIMATTER_GRID])
        return ratingsValid && !interferingEvent
    }
}
