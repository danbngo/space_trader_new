class KnowledgeCodexNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins gathering huge amounts of data and knowledge from around the system into a central AI-augmented data center!`,
            `Academics from other planets flock to ${coloredName(planet)} to participate, share, and learn from the magnificent Knowledge Codex!`,
            `The Knowledge Codex on ${coloredName(planet)} is burned down by fanatics who disagree with its contents!`,
            ``,
            NT.KNOWLEDGE_CODEX, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.COMPUTERS, CL.VERY_HIGH],
                    [CARGO_TYPES.NANITES, CL.HIGH]
                ]))
            },
            {
                education: CL.VERY_HIGH,
                technology: CL.HIGH,
                culture: CL.HIGH,
                wealth: CL.HIGH,
                prestige: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH
            },
            {
                prestige: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW,
                education: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology, education, security (protect it), and low religious fundamentalism
        this.rollOutcome(p.c.technology * p.c.education * p.c.security / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high tech and education
        const ratingsValid = p.c.technology > CL.HIGH && p.c.education > CL.HIGH
        
        // Can't have multiple education megaprojects
        const interferingEvent = News.planetHasAnyNews(p, [NT.INDOCTRINATION_PROGRAM, NT.BRAIN_DRAIN, NT.PHILOSOPHICAL_DEBATES, NT.KNOWLEDGE_CODEX])
        return ratingsValid && !interferingEvent
    }
}
