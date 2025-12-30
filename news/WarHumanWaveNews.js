class WarHumanWaveNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches desperate human wave attacks against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s human wave offensive finally ends with staggering casualties!`,
            ``,
            `Peace treaty ends ${coloredName(planet)}'s human wave offensive before full deployment!`,
            NT.WAR_HUMAN_WAVE, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                population: CL.VERY_LOW, // massive casualties
                education: CL.LOW, // officers leading charges
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: massive permanent losses
        Object.assign(this.completeEffects[0], {
            population: CL.NO_REGRESSION, // dead don't return
            education: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION,
        })
        // Defender: permanent losses
        Object.assign(this.completeEffects[1], {
            education: CL.LOW, // officers killed defending
            army: CL.SLIGHTLY_LOW, // ground forces worn down
        })

        // Cancelled: peace declared mid-offensive, troops pull back
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                population: News.clHalfRegression(CL.VERY_LOW), // some casualties already taken
                education: News.clHalfRegression(CL.LOW),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                education: News.clHalfRegression(CL.LOW),
                army: News.clHalfRegression(CL.SLIGHTLY_LOW),
            })
        ]
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if war still ongoing
        const stillAtWar = p.c.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        if (!stillAtWar) {
            this.cancelled = true
        }
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = p.c.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Requires high population to sacrifice
        const populationValid = p.c.population > CL.HIGH
        // we need to be desperate
        const militaryValid = planet.militaryPower/tp.militaryPower < CL.LOW
        // Can't have human wave already
        const interferingEvent = News.hasNews(NT.WAR_HUMAN_WAVE, planet, targetPlanet)
        return relationshipValid && hasWar && populationValid && militaryValid && !interferingEvent
    }
}
