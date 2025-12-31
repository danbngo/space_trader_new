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

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = Civilization.areAtWar(p, tp)
        // Requires high security to conduct sabotage
        const securityValid = (p.c.security > CL.MEDIUM) && (p.c.security/tp.c.security > CL.HIGH)
        // Can't have sabotage already
        const interferingEvent = News.hasNews(NT.WAR_SABOTAGE, p, tp)
        return relationshipValid && securityValid && !interferingEvent
    }
}
