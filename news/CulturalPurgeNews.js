class CulturalPurgeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s government launches a systematic purge of forbidden knowledge, burning books and erasing historical records that contradict state dogma!`,
            `${coloredName(planet)}'s purge concludes, leaving a sterilized version of history and knowledge in its wake!`,
            `${coloredName(planet)}'s cultural purge ends as artists and intellectuals mount a cultural resistance against the censors!`,
            '',
            NT.CULTURAL_PURGE, planet
        )

        this.addPlanetEffect(
            {
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.HOLOCUBES, CL.EXTREMELY_LOW]])),
                education: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW,
            },
            {
                education: CL.VERY_LOW,
                culture: CL.LOW,
                security: CL.HIGH,
                prestige: CL.LOW,
            },
            {
                culture: CL.HIGH,
                security: CL.SLIGHTLY_LOW,
                education: CL.SLIGHTLY_HIGH,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success based on security vs culture (artistic rebellion)
        this.rollOutcome(p.c.security / p.c.culture, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // More likely if education/technology is high but security is also very high (authoritarian control)
        const ratingsValid = (p.c.education > CL.SLIGHTLY_HIGH || p.c.technology > CL.SLIGHTLY_HIGH) && p.c.security > CL.HIGH
        // Planet must not already be in anarchy or puppet state
        const interferingEvent = News.planetHasAnyNews(p, NT_GOVERNANCE_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
