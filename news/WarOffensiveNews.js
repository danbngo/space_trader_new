class WarOffensiveNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches a major offensive against ${coloredName(targetPlanet)}, relying on its generals!`,
            `${coloredName(planet)}'s brilliant offensive has wreaked havoc on ${coloredName(targetPlanet)}!`,
            '',
            `${coloredName(planet)}'s offensive against ${coloredName(targetPlanet)} is cancelled! Peace treaty signed!`,
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

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Victor: minor permanent losses, prestige gain persists
        Object.assign(this.completeEffects[0], {
            shipyardNumShips: News.clHalfRegression(this.completeEffects[0].shipyardNumShips),
            guildNumOfficers: News.clHalfRegression(this.completeEffects[0].guildNumOfficers),
        })
        // Loser: major permanent losses
        Object.assign(this.completeEffects[1], {
            shipyardNumShips: CL.NO_REGRESSION,
            guildNumOfficers: CL.NO_REGRESSION,
            military: CL.SLIGHTLY_LOW,
        })

        this.cancelEffects = this.completeEffects.map(effect => {
            const e = effect.clone()
            e.shipyardNumShips = News.clHalfRegression(effect.shipyardNumShips)
            e.guildNumOfficers = News.clHalfRegression(effect.guildNumOfficers)
            return e
        })
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if peace was forced during offensive
        const currentRel1 = planet.culture.relationships.get(targetPlanet)
        const currentRel2 = targetPlanet.culture.relationships.get(planet)
        this.cancelled = (currentRel1 !== RELATIONSHIP_TYPES.WAR || currentRel2 !== RELATIONSHIP_TYPES.WAR)
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
