class WarSabotageNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches covert sabotage operations against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s sabotage campaign against ${coloredName(targetPlanet)} concludes!`,
            '',
            `${coloredName(planet)}'s sabotage operations against ${coloredName(targetPlanet)} are called off!`,
            NT.WAR_SABOTAGE, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                security: CL.LOW,
            },
            {
                security: CL.NO_REGRESSION,
            },
            {},
            {}
        )

        this.addTargetPlanetEffect(
            {
                industry: CL.LOW
            },
            {
                industry: CL.SLIGHTLY_HIGH
            },
            {},
            {
                industry: CL.SLIGHTLY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if peace was forced during sabotage
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
        // Requires high security to conduct sabotage
        const securityValid = (p.c.security > CL.MEDIUM) && (p.c.security/tp.c.security > CL.HIGH)
        // Can't have sabotage already
        const interferingEvent = News.hasNews(NT.WAR_SABOTAGE, planet, targetPlanet)
        return relationshipValid && hasWar && securityValid && !interferingEvent
    }
}
