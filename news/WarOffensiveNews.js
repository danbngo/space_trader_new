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
                civilizationMultipliers: new Civilization({
                    military: CL.LOW,
                    education: CL.SLIGHTLY_LOW
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    military: CL.SLIGHTLY_LOW,
                    education: CL.SLIGHTLY_LOW
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Victor: minor permanent losses, prestige gain persists
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            military: CL.SLIGHTLY_HIGH,
            education: CL.SLIGHTLY_HIGH
        }))
        // Loser: major permanent losses
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            military: CL.SLIGHTLY_LOW,
            education: CL.NO_REGRESSION
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            military: CL.SLIGHTLY_HIGH,
            education: CL.SLIGHTLY_HIGH
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            military: CL.SLIGHTLY_HIGH,
            education: CL.SLIGHTLY_HIGH
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if peace was forced during offensive
        const currentRel1 = p.c.relationships.get(targetPlanet)
        const currentRel2 = tp.c.relationships.get(planet)
        this.cancelled = (currentRel1 !== RELATIONSHIP_TYPES.WAR || currentRel2 !== RELATIONSHIP_TYPES.WAR)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = p.c.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Our officers must be better than theirs
        const advantage = p.c.education/tp.c.education >= CL.SLIGHTLY_HIGH
        // Can't have victory already
        const interferingEvent = News.hasNews(NT.WAR_OFFENSIVE, planet, targetPlanet)
        return relationshipValid && hasWar && advantage && !interferingEvent
    }
}
