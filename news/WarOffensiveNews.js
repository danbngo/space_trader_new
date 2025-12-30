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
                army: CL.SLIGHTLY_LOW,
                navy: CL.LOW,
                education: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                army: CL.SLIGHTLY_LOW,
                navy: CL.LOW,
                education: CL.SLIGHTLY_LOW,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Victor: minor permanent losses, prestige gain persists
        Object.assign(this.completeEffects[0], {
            navy: News.clHalfRegression(this.completeEffects[0].navy),
            education: News.clHalfRegression(this.completeEffects[0].education),
        })
        // Loser: major permanent losses
        Object.assign(this.completeEffects[1], {
            navy: CL.NO_REGRESSION,
            education: CL.NO_REGRESSION,
            army: CL.SLIGHTLY_LOW,
        })

        this.cancelEffects = this.completeEffects.map(effect => {
            const e = effect.clone()
            e.navy = News.clHalfRegression(effect.navy)
            e.education = News.clHalfRegression(effect.education)
            return e
        })
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if peace was forced during offensive
        const currentRel1 = p.c.relationships.get(targetPlanet)
        const currentRel2 = targetPlanet.c.relationships.get(planet)
        this.cancelled = (currentRel1 !== RELATIONSHIP_TYPES.WAR || currentRel2 !== RELATIONSHIP_TYPES.WAR)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = p.c.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Our officers must be better than theirs
        const advantage = p.c.education/targetPlanet.c.education >= CL.SLIGHTLY_HIGH
        // Can't have victory already
        const interferingEvent = News.hasNews(NT.WAR_OFFENSIVE, planet, targetPlanet)
        return relationshipValid && hasWar && advantage && !interferingEvent
    }
}
