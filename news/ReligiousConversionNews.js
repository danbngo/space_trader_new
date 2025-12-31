class ReligiousConversionNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} seeks to convert ${coloredName(targetPlanet)} to ${colorSpan(planet.c.stateReligion?.name || 'their faith', planet.c.stateReligion?.color || COLORS.White)} as the official state religion!`,
            `${coloredName(targetPlanet)} officially adopts ${colorSpan(planet.c.stateReligion?.name || 'the faith', planet.c.stateReligion?.color || COLORS.White)} as its state religion, deepening ties with ${coloredName(planet)}!`,
            `${coloredName(targetPlanet)} resists religious conversion from ${coloredName(planet)}, maintaining its current faith!`,
            ``,
            NT.RELIGIOUS_CONVERSION, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.SLIGHTLY_LOW,
            }
        )

        this.addTargetPlanetEffect(
            {
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                onApply: () => {
                    // Convert state religion to match planet's religion
                    if (planet.c.stateReligion) {
                        targetPlanet.c.stateReligion = planet.c.stateReligion
                        // Increase the converting religion's presence
                        const currentAmount = targetPlanet.c.religions.getAmount(planet.c.stateReligion) || 0
                        targetPlanet.c.religions.setAmount(planet.c.stateReligion, currentAmount + 0.3)
                        targetPlanet.c.religions.normalize()
                    }
                },
                culture: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                culture: CL.SLIGHTLY_LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Success depends on converting religion's existing presence and cultural influence
        const religionPresence = p.c.stateReligion ? (tp.c.religions.getAmount(p.c.stateReligion) || 0) : 0
        this.rollOutcome((religionPresence + 0.1) * p.c.culture * p.c.prestige / tp.c.culture, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Requires state religion with high presence in target (>30%) but not their state religion
        if (!p.c.stateReligion) return false
        if (tp.c.stateReligion === p.c.stateReligion) return false
        
        const religionPresence = tp.c.religions.getAmount(p.c.stateReligion) || 0
        const highPresence = religionPresence > 0.3
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        const interferingEvent = News.hasNews(NT.RELIGIOUS_CONVERSION, p, tp)
        
        return highPresence && relationshipsValid && !interferingEvent
    }
}
