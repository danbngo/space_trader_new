class VirtualRealityChambersNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} unveils controversial virtual reality chambers allowing citizens to live permanently in simulated worlds!`,
            `${coloredName(planet)} allows VR chamber use to continue despite concerns, creating a thriving virtual economy!`,
            `${coloredName(planet)} dismantles VR chamber networks after widespread addiction concerns!`,
            '',
            NT.VIRTUAL_REALITY_CHAMBERS, planet
        )

        this.addPlanetEffect(
            {
                technology: CL.SLIGHTLY_HIGH,
            },
            {
                population: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
            },
            {
                culture: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,
                taxes: CL.SLIGHTLY_HIGH,
            }
        )
    }

    determineOutcome() {
        // Success based on technology, education, and wealth
        this.rollOutcome(this.planet.c.technology * this.planet.c.education * this.planet.c.wealth, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // More likely in wealthy, high-tech societies
        const ratingsValid = p.c.technology > CL.HIGH && p.c.wealth > CL.MEDIUM
        return ratingsValid
    }
}
