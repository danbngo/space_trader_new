class WarSurrenderNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} sues for peace with ${coloredName(planet)}, offering indemnity and territorial concessions!`,
            `${coloredName(targetPlanet)} has negotiated the terms of its surrender to ${coloredName(planet)}!`,
            ``,
            `Negotiations collapse as ${coloredName(targetPlanet)} rejects surrender terms from ${coloredName(planet)}!`,
            NT.WAR_SURRENDER, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({})
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    military: CL.LOW,
                    prestige: CL.LOW
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Victor: gains from peace treaty
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            prestige: CL.HIGH,
            territory: CL.SLIGHTLY_HIGH,
            wealth: CL.HIGH  // War indemnity
        }))
        // Loser: permanent losses from surrender
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            territory: CL.LOW,  // Territorial concessions
            wealth: CL.LOW,  // War indemnity paid
            military: CL.LOW,  // Forced demilitarization
            prestige: CL.LOW  // Shame of defeat
        }))
        this.completeEffects[1].forcePeace = true  // Ends the war

        // Cancelled: negotiations break down, war continues
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            military: CL.SLIGHTLY_HIGH,  // Partial recovery
            prestige: CL.SLIGHTLY_HIGH
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Check if war still ongoing
        const stillAtWar = p.c.relationships.get(tp) === RELATIONSHIP_TYPES.WAR
        if (!stillAtWar) return true
        
        // Negotiations succeed unless target suddenly regains strength
        const rejectProbability = (tp.militaryPower / p.militaryPower) * 0.2
        return Math.random() < rejectProbability
    }

    determineOutcome() {
        // Surrender negotiations always complete if not cancelled
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = p.c.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Target should be significantly weaker (losing the war)
        const militaryValid = planet.militaryPower/tp.militaryPower > CL.HIGH
        // Can't have surrender already
        const interferingEvent = News.hasNews(NT.WAR_SURRENDER, planet, targetPlanet)
        return relationshipValid && hasWar && militaryValid && !interferingEvent
    }
}
