class InquisitionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Religious authorities on ${coloredName(planet)} launch an inquisition, purging heretics and dissenters in the name of orthodoxy!`,
            `${coloredName(planet)}'s inquisition is checked by pushback from secular institutions, limiting its excesses!`,
            `${coloredName(planet)}'s inquisition runs rampant and unchecked, terrorizing the population and crushing dissent!`,
            ``,
            NT.INQUISITION, planet
        )

        this.addPlanetEffect(
            {
                education: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW,
            },
            {
                education: CL.SLIGHTLY_HIGH,
                culture: CL.HIGH,
                technology: CL.SLIGHTLY_HIGH,
            },
            {
                education: CL.LOW,
                culture: CL.LOW,
                technology: CL.LOW,
                security: CL.SLIGHTLY_HIGH,
                wealth: CL.LOW,
                inflation: CL.LOW,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success (limiting excesses) depends on education, culture, and secular strength vs religious fervor
        this.rollOutcome(p.c.education * p.c.culture / p.c.security, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // More likely when security is high (enforcement) and there's religious presence
        const ratingsValid = p.c.security > CL.MEDIUM
        const hasReligion = p.c.religions && p.c.religions.counts.size > 0
        const interferingEvent = News.planetHasAnyNews(p, [...NT_GOVERNANCE_PREVENTING, NT.INQUISITION])
        return ratingsValid && hasReligion && !interferingEvent
    }
}
