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
                military: CL.LOW,
                prestige: CL.LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Victor: gains from peace treaty
        Object.assign(this.endEffects[0], {
            prestige: CL.HIGH,
            territory: CL.SLIGHTLY_HIGH,
            credits: CL.HIGH, // war indemnity
        })
        // Loser: permanent losses from surrender
        Object.assign(this.endEffects[1], {
            territory: CL.LOW, // territorial concessions
            credits: CL.LOW, // war indemnity paid
            military: CL.LOW, // forced demilitarization
            prestige: CL.LOW, // shame of defeat
            forcePeace: true, // ends the war
        })

        // Cancelled: negotiations break down, war continues
        this.cancelEndEffects = [
            new NewsEffect({
                planet: this.planet,
                // Victor just wastes time
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                military: News.clHalfRegression(CL.LOW), // partial recovery
                prestige: News.clHalfRegression(CL.LOW),
            })
        ]
    }

    determineEnding() {
        const {planet, targetPlanet} = this
        // Check if war still ongoing
        const stillAtWar = planet.culture.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        if (!stillAtWar) {
            this.cancelled = true
            return
        }
        // Negotiations succeed unless target suddenly regains strength
        const rejectProbability = (targetPlanet.militaryPower / planet.militaryPower) * 0.2
        this.cancelled = Math.random() < rejectProbability
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Must be at war
        const relationshipValid = planet.culture.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Target should be significantly weaker (losing the war)
        const militaryValid = planet.militaryPower/targetPlanet.militaryPower > CL.HIGH
        // Can't have surrender already
        const interferingEvent = News.hasNews(NT.WAR_SURRENDER, planet, targetPlanet)
        return relationshipValid && hasWar && militaryValid && !interferingEvent
    }
}
