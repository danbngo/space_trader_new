class PhilosophicalDebatesNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} spawns a robust philosophical culture with active debates and notable figures!`,
            `People from around the system flock to ${coloredName(planet)} to hear the fascinating philosophical debates!`,
            `Repression from conservative authorities on ${coloredName(planet)} crushes the philosophical movements, accusing them of corrupting the youth!`,
            ``,
            NT.PHILOSOPHICAL_DEBATES, planet
        )

        this.addPlanetEffect(
            {
                education: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.HOLOCUBES, CL.SLIGHTLY_LOW]
                ]))
            },
            {
                education: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                education: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on culture, education, and freedom (low corruption/security)
        this.rollOutcome(p.c.culture * p.c.education / (p.c.corruption * p.c.security), CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires education and culture
        const ratingsValid = p.c.education > CL.SLIGHTLY_LOW && p.c.culture > CL.SLIGHTLY_LOW
        
        // Can't have multiple education events
        const interferingEvent = News.planetHasAnyNews(p, [NT.INDOCTRINATION_PROGRAM, NT.BRAIN_DRAIN, NT.PHILOSOPHICAL_DEBATES, NT.KNOWLEDGE_CODEX])
        return ratingsValid && !interferingEvent
    }
}
