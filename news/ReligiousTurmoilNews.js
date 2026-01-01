class ReligiousTurmoilNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} descends into religious turmoil as competing faiths vie for dominance!`,
            `${coloredName(planet)}'s religious turmoil ends peacefully as one faith gains supremacy through conversion and dialogue!`,
            `${coloredName(planet)}'s religious turmoil erupts into violence as the dominant faith purges its rivals!`,
            ``,
            NT.RELIGIOUS_TURMOIL, planet
        )

        this.addPlanetEffect(
            {
                security: CL.LOW,
                crime: CL.HIGH,
                culture: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
            },
            {
                onApply: () => {
                    // Peaceful transition - pick most popular religion, reduce others moderately
                    if (planet.c.religions && planet.c.religions.counts.size > 0) {
                        let maxProportion = 0
                        let dominantReligion = null
                        for (const [religion, proportion] of planet.c.religions.counts.entries()) {
                            if (proportion > maxProportion) {
                                maxProportion = proportion
                                dominantReligion = religion
                            }
                        }
                        
                        if (dominantReligion) {
                            // Reduce other religions by 50%
                            for (const [religion, proportion] of planet.c.religions.counts.entries()) {
                                if (religion !== dominantReligion) {
                                    planet.c.religions.setAmount(religion, proportion * 0.5)
                                }
                            }
                            planet.c.religions.normalize()
                            planet.c.stateReligion = dominantReligion
                        }
                    }
                },
                security: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                onApply: () => {
                    // Violent purge - dominant religion eliminates rivals
                    if (planet.c.religions && planet.c.religions.counts.size > 0) {
                        let maxProportion = 0
                        let dominantReligion = null
                        for (const [religion, proportion] of planet.c.religions.counts.entries()) {
                            if (proportion > maxProportion) {
                                maxProportion = proportion
                                dominantReligion = religion
                            }
                        }
                        
                        if (dominantReligion) {
                            // Remove all other religions
                            const religionsToRemove = []
                            for (const [religion] of planet.c.religions.counts.entries()) {
                                if (religion !== dominantReligion) {
                                    religionsToRemove.push(religion)
                                }
                            }
                            for (const religion of religionsToRemove) {
                                planet.c.religions.counts.delete(religion)
                            }
                            planet.c.religions.normalize()
                            planet.c.stateReligion = dominantReligion
                        }
                    }
                },
                security: CL.LOW,
                population: CL.LOW,
                culture: CL.LOW,
                prestige: CL.LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Peaceful outcome more likely with high education and culture
        this.rollOutcome(p.c.education * p.c.culture / p.c.security, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Check if at least 2 religions have at least 0.1 proportion
        if (!p.c.religions || p.c.religions.counts.size < 2) return false
        
        const proportions = Array.from(p.c.religions.counts.values())
        const significantReligions = proportions.filter(prop => prop >= 0.1)
        
        const hasCompetingFaiths = significantReligions.length >= 2
        const interferingEvent = News.planetHasAnyNews(p, [...NT_GOVERNANCE_PREVENTING, NT.RELIGIOUS_TURMOIL])
        
        return hasCompetingFaiths && !interferingEvent
    }
}
