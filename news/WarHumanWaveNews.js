class WarHumanWaveNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches desperate human wave attacks against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s human wave offensive finally ends with staggering casualties!`,
            NT.WAR_HUMAN_WAVE, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                population: CL.VERY_LOW, // massive casualties
                guildNumOfficers: CL.LOW, // officers leading charges
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: massive permanent losses
        Object.assign(this.endEffects[0], {
            population: CL.NO_REGRESSION, // dead don't return
            guildNumOfficers: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION,
        })
        // Defender: permanent losses
        Object.assign(this.endEffects[1], {
            guildNumOfficers: CL.LOW, // officers killed defending
            military: CL.SLIGHTLY_LOW, // ground forces worn down
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Must be at war
        const relationshipValid = planet.culture.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Requires high population to sacrifice
        const populationValid = planet.culture.population > CL.HIGH
        // we need to be desperate
        const militaryValid = planet.militaryPower/targetPlanet.militaryPower < CL.LOW
        // Can't have human wave already
        const interferingEvent = News.hasNews(NT.WAR_HUMAN_WAVE, planet, targetPlanet)
        return relationshipValid && hasWar && populationValid && militaryValid && !interferingEvent
    }
}
