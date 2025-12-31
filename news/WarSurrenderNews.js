class WarSurrenderNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} sues for peace with ${coloredName(planet)}, offering indemnity and territorial concessions!`,
            `${coloredName(targetPlanet)} has negotiated the terms of its surrender to ${coloredName(planet)}!`,
            ``,
            `Negotiations collapse as ${coloredName(targetPlanet)} rejects surrender terms from ${coloredName(planet)}!`,
            NT.WAR_SURRENDER, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                planet: this.planet
            },
            {
                prestige: CL.HIGH,
                territory: CL.SLIGHTLY_HIGH,
            }
        )

        this.addTargetPlanetEffect(
            {
                military: CL.LOW,
            },
            {
                territory: CL.LOW,
                military: CL.LOW,
                forcePeace: true
            },
            {},
            {
                military: CL.SLIGHTLY_HIGH,
            }
        )
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
