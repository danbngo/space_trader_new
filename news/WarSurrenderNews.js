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
                targetPlanet: this.targetPlanet,
                // Victor gets nothing during negotiation
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                // Losing side begins negotiations, temporary instability
                army: CL.LOW,
                navy: CL.LOW,
                prestige: CL.LOW,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Victor: gains from peace treaty
        Object.assign(this.completeEffects[0], {
            prestige: CL.HIGH,
            territory: CL.SLIGHTLY_HIGH,
            wealth: CL.HIGH, // war indemnity
        })
        // Loser: permanent losses from surrender
        Object.assign(this.completeEffects[1], {
            territory: CL.LOW, // territorial concessions
            wealth: CL.LOW, // war indemnity paid
            army: CL.LOW, // forced demilitarization
            navy: CL.LOW,
            prestige: CL.LOW, // shame of defeat
            forcePeace: true, // ends the war
        })

        // Cancelled: negotiations break down, war continues
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                // Victor just wastes time
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                army: News.clHalfRegression(CL.LOW), // partial recovery
                navy: News.clHalfRegression(CL.LOW),
                prestige: News.clHalfRegression(CL.LOW),
            })
        ]
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if war still ongoing
        const stillAtWar = p.c.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        if (!stillAtWar) {
            this.cancelled = true
            return
        }
        // Negotiations succeed unless target suddenly regains strength
        const rejectProbability = (tp.militaryPower / planet.militaryPower) * 0.2
        this.cancelled = Math.random() < rejectProbability
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
