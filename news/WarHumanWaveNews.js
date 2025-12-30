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
                civilizationMultipliers: new Civilization({
                    population: CL.VERY_LOW,  // Massive casualties
                    education: CL.LOW  // Officers leading charges
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                civilizationMultipliers: new Civilization({})
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: massive permanent losses
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.NO_REGRESSION,  // Dead don't return
            education: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION
        }))
        // Defender: permanent losses
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            education: CL.LOW,  // Officers killed defending
            military: CL.SLIGHTLY_LOW  // Ground forces worn down
        }))

        // Cancelled: peace declared mid-offensive, troops pull back
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_LOW,  // Some casualties already taken
            education: CL.SLIGHTLY_HIGH
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            education: CL.SLIGHTLY_HIGH,
            military: CL.SLIGHTLY_HIGH
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if war no longer ongoing
        return p.c.relationships.get(tp) !== RELATIONSHIP_TYPES.WAR
    }

    determineOutcome() {
        // Human wave attacks always complete (no rollOutcome needed)
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
