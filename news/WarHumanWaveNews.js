class WarHumanWaveNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches desperate human wave attacks against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s human wave offensive finally ends with staggering casualties!`,
            ``,
            `Peace treaty ends ${coloredName(planet)}'s human wave offensive before full deployment!`,
            NT.WAR_HUMAN_WAVE, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                population: CL.VERY_LOW,
                education: CL.LOW
            },
            {
                population: CL.NO_REGRESSION,
                education: CL.NO_REGRESSION,
            },
            {},
            {
                population: CL.SLIGHTLY_LOW,
            }
        )

        this.addTargetPlanetEffect(
            {},
            {
                education: CL.LOW,
            },
            {},
            {}
        )
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
