class ReligionInquisitionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Religious authorities on ${coloredName(planet)} launch an inquisition, purging heretics and dissenters in the name of orthodoxy!`,
            `${coloredName(planet)}'s inquisition is checked by pushback from secular institutions, limiting its excesses!`,
            `${coloredName(planet)}'s inquisition runs rampant and unchecked, terrorizing the population and crushing dissent!`,
            ``,
            NT.RELIGION_INQUISITION, planet
        )

        this.addPlanetEffect(
            {
                onApply: () => {
                    // Inquisition reduces non-state religions
                    if (planet.c.stateReligion && planet.c.religions) {
                        for (const [religion, proportion] of planet.c.religions.counts.entries()) {
                            if (religion !== planet.c.stateReligion) {
                                planet.c.religions.setAmount(religion, proportion * 0.7)
                            }
                        }
                        planet.c.religions.normalize()
                    }
                },
                education: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW,
            },
            {
                onApply: () => {
                    // Success - moderate purge with state religion increase
                    if (planet.c.stateReligion && planet.c.religions) {
                        for (const [religion, proportion] of planet.c.religions.counts.entries()) {
                            if (religion !== planet.c.stateReligion) {
                                planet.c.religions.setAmount(religion, proportion * 0.5)
                            }
                        }
                        const stateAmount = planet.c.religions.getAmount(planet.c.stateReligion) || 0
                        planet.c.religions.setAmount(planet.c.stateReligion, stateAmount + 0.2)
                        planet.c.religions.normalize()
                    }
                },
                education: CL.SLIGHTLY_HIGH,
                culture: CL.HIGH,
                technology: CL.SLIGHTLY_HIGH,
            },
            {
                onApply: () => {
                    // Failure - extreme purge, possibly eliminating other religions
                    if (planet.c.stateReligion && planet.c.religions) {
                        const religionsToRemove = []
                        for (const [religion, proportion] of planet.c.religions.counts.entries()) {
                            if (religion !== planet.c.stateReligion) {
                                if (proportion < 0.15) {
                                    religionsToRemove.push(religion)
                                } else {
                                    planet.c.religions.setAmount(religion, proportion * 0.2)
                                }
                            }
                        }
                        for (const religion of religionsToRemove) {
                            planet.c.religions.counts.delete(religion)
                        }
                        planet.c.religions.normalize()
                    }
                },
                education: CL.LOW,
                culture: CL.LOW,
                technology: CL.LOW,
                security: CL.SLIGHTLY_HIGH,
                wealth: CL.LOW,
                reserves: CL.HIGH,
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
        const interferingEvent = News.planetHasAnyNews(p, [...NT_GOVERNANCE_PREVENTING, NT.RELIGION_INQUISITION])
        return ratingsValid && hasReligion && !interferingEvent
    }
}
