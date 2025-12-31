class ReligionGrandCouncilNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} hosts a grand religious council for ${colorSpan(planet.c.stateReligion?.name || 'the faith', planet.c.stateReligion?.color || COLORS.White)}, uniting believers across the system!`,
            `${coloredName(planet)}'s grand council concludes in spiritual unity, uplifting all followers of ${colorSpan(planet.c.stateReligion?.name || 'the faith', planet.c.stateReligion?.color || COLORS.White)}!`,
            `${coloredName(planet)}'s grand council devolves into theological disputes and schism!`,
            ``,
            NT.RELIGION_GRAND_COUNCIL, planet
        )

        this.addPlanetEffect(
            {
                wealth: CL.LOW,
                security: CL.SLIGHTLY_HIGH,
            },
            {
                onApply: () => {
                    // All planets with same state religion gain culture and prestige
                    if (planet.c.stateReligion) {
                        for (const p of PLANETS) {
                            if (p !== planet && p.c.stateReligion === planet.c.stateReligion) {
                                p.c.culture *= CL.SLIGHTLY_HIGH
                                p.c.prestige *= CL.SLIGHTLY_HIGH
                            }
                        }
                    }
                },
                wealth: CL.SLIGHTLY_LOW,
                culture: CL.VERY_HIGH,
                prestige: CL.VERY_HIGH,
            },
            {
                wealth: CL.LOW,
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success based on culture and education
        this.rollOutcome(p.c.culture * p.c.education, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires state religion, decent wealth, and at least one other planet with same religion
        const hasStateReligion = p.c.stateReligion !== null
        const hasCoReligionists = hasStateReligion && PLANETS.some(other => other !== p && other.c.stateReligion === p.c.stateReligion)
        const ratingsValid = p.c.wealth > CL.MEDIUM && p.c.culture > CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(p, [...NT_ECONOMY_PREVENTING, NT.RELIGION_GRAND_COUNCIL])
        return hasStateReligion && hasCoReligionists && ratingsValid && !interferingEvent
    }
}
