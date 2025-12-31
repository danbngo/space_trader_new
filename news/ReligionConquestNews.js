class ReligionConquestNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches a religious conquest to spread ${colorSpan(planet.c.stateReligion?.name || 'their faith', planet.c.stateReligion?.color || COLORS.White)} by force!`,
            `${coloredName(planet)}'s religious conquest succeeds, bringing multiple worlds under its spiritual authority!`,
            `${coloredName(planet)}'s religious conquest collapses as its armies are defeated!`,
            ``,
            NT.RELIGION_CONQUEST, planet
        )

        // Find target planets (neutral/hostile, different religion, weaker militarily)
        const validTargets = PLANETS.filter(tp => 
            tp !== planet && 
            tp.c.stateReligion !== planet.c.stateReligion &&
            !Civilization.areAllies(planet, tp) &&
            planet.c.military > tp.c.military
        )
        this.targets = validTargets.slice(0, Math.min(3, validTargets.length))

        this.addPlanetEffect(
            {
                army: CL.LOW,
                navy: CL.LOW,
                wealth: CL.LOW,
            },
            {
                onApply: () => {
                    // On success, all targets become tense/at war and lose territory/prestige
                    for (const target of this.targets) {
                        if (!Civilization.areAtWar(planet, target)) {
                            planet.c.relationships.set(target, RELATIONSHIP_TYPES.WAR)
                            target.c.relationships.set(planet, RELATIONSHIP_TYPES.WAR)
                        }
                        target.c.territory *= CL.LOW
                        target.c.prestige *= CL.LOW
                        target.c.army *= CL.LOW
                        // Increase presence of conquering religion
                        const currentAmount = target.c.religions.getAmount(planet.c.stateReligion) || 0
                        target.c.religions.setAmount(planet.c.stateReligion, currentAmount + 0.25)
                        target.c.religions.normalize()
                    }
                },
                army: CL.LOW,
                navy: CL.LOW,
                territory: CL.VERY_HIGH,
                prestige: CL.VERY_HIGH,
            },
            {
                army: CL.VERY_LOW,
                navy: CL.VERY_LOW,
                wealth: CL.VERY_LOW,
                prestige: CL.VERY_LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success based on overwhelming military might
        this.rollOutcome(p.c.army * p.c.navy * p.c.technology, CL.HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires state religion, high military, and valid targets
        const hasStateReligion = p.c.stateReligion !== null
        const hasValidTargets = PLANETS.filter(tp => 
            tp !== p && 
            tp.c.stateReligion !== p.c.stateReligion &&
            !Civilization.areAllies(p, tp) &&
            p.c.military > tp.c.military
        ).length >= 2
        const ratingsValid = p.c.army > CL.VERY_HIGH && p.c.navy > CL.VERY_HIGH
        const interferingEvent = News.planetHasAnyNews(p, [...NT_WARLIKE, NT.RELIGION_CONQUEST])
        return hasStateReligion && hasValidTargets && ratingsValid && !interferingEvent
    }
}
