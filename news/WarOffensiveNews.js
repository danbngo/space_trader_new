class WarOffensiveNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches a major offensive against ${coloredName(targetPlanet)}, relying on its generals!`,
            `${coloredName(planet)}'s brilliant offensive has wreaked havoc on ${coloredName(targetPlanet)}!`,
            NT.WAR_OFFENSIVE, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                military: CL.SLIGHTLY_LOW,
                shipyardNumShips: CL.LOW,
                guildNumOfficers: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                military: CL.SLIGHTLY_LOW,
                shipyardNumShips: CL.LOW,
                guildNumOfficers: CL.SLIGHTLY_LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Victor: minor permanent losses, prestige gain persists
        Object.assign(this.endEffects[0], {
            shipyardNumShips: News.clHalfRegression(this.endEffects[0].shipyardNumShips),
            guildNumOfficers: News.clHalfRegression(this.endEffects[0].guildNumOfficers),
        })
        // Loser: major permanent losses
        Object.assign(this.endEffects[1], {
            shipyardNumShips: CL.NO_REGRESSION,
            guildNumOfficers: CL.NO_REGRESSION,
            military: CL.SLIGHTLY_LOW,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Must be at war
        const relationshipValid = planet.culture.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Our officers must be better than theirs
        const advantage = planet.culture.officerQuality/targetPlanet.culture.officerQuality >= CL.SLIGHTLY_HIGH
        // Can't have victory already
        const interferingEvent = News.hasNews(NT.WAR_OFFENSIVE, planet, targetPlanet)
        return relationshipValid && hasWar && advantage && !interferingEvent
    }
}
