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
                ships: CL.LOW,
                labor: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                military: CL.SLIGHTLY_LOW,
                ships: CL.LOW,
                labor: CL.SLIGHTLY_LOW,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Victor: minor permanent losses, prestige gain persists
        Object.assign(this.completeEffects[0], {
            ships: News.clHalfRegression(this.completeEffects[0].ships),
            labor: News.clHalfRegression(this.completeEffects[0].labor),
        })
        // Loser: major permanent losses
        Object.assign(this.completeEffects[1], {
            ships: CL.NO_REGRESSION,
            labor: CL.NO_REGRESSION,
            military: CL.SLIGHTLY_LOW,
        })

        this.cancelEffects = this.completeEffects.map(effect => {
            const e = effect.clone()
            e.ships = News.clHalfRegression(effect.ships)
            e.labor = News.clHalfRegression(effect.labor)
            return e
        })
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if peace was forced during offensive
        const currentRel1 = planet.civilization.relationships.get(targetPlanet)
        const currentRel2 = targetPlanet.civilization.relationships.get(planet)
        this.cancelled = (currentRel1 !== RELATIONSHIP_TYPES.WAR || currentRel2 !== RELATIONSHIP_TYPES.WAR)
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Must be at war
        const relationshipValid = planet.civilization.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Our officers must be better than theirs
        const advantage = planet.civilization.education/targetPlanet.civilization.education >= CL.SLIGHTLY_HIGH
        // Can't have victory already
        const interferingEvent = News.hasNews(NT.WAR_OFFENSIVE, planet, targetPlanet)
        return relationshipValid && hasWar && advantage && !interferingEvent
    }
}
