class ExperimentalEnergyNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} uses a massive particle collider to unlock new particles and find sources of energy!`,
            `${coloredName(planet)} discovers new base particles that can be applied in experimental energy projects!`,
            `${coloredName(planet)}'s particle collider explodes, unleashing a barrage of harmful particles that lance through the planet!`,
            ``,
            NT.EXPERIMENTAL_ENERGY, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.HIGH
            },
            {
                technology: CL.HIGH,
                industry: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology, education, and security (proper containment)
        this.rollOutcome(p.c.technology * p.c.education * p.c.security / p.c.corruption, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires very high technology
        const ratingsValid = p.c.technology > CL.HIGH && p.c.education > CL.SLIGHTLY_HIGH
        
        // Can't have multiple experimental science projects
        const interferingEvent = News.planetHasAnyNews(p, [NT.EXPERIMENTAL_ENERGY, NT.MEGA_AI, NT.ADVANCED_NANITES, NT.KNOWLEDGE_CODEX])
        return ratingsValid && !interferingEvent
    }
}
