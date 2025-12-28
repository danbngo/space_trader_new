class WarSabotageNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches covert sabotage operations against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s sabotage campaign against ${coloredName(targetPlanet)} concludes!`,
            NT.WAR_SABOTAGE, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                security: CL.LOW, // agents deployed
                guildNumOfficers: CL.LOW, // agents/spies
                officerQuality: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                military: CL.LOW, // sabotaged military infrastructure
                industry: CL.LOW, // factories bombed
                shipyardNumShips: CL.SLIGHTLY_LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: agents lost permanently
        Object.assign(this.endEffects[0], {
            security: CL.NO_REGRESSION, // security apparatus damaged
            guildNumOfficers: CL.NO_REGRESSION, // agents don't return
            officerQuality: CL.NO_REGRESSION,
        })
        // Defender: permanent damage from sabotage
        Object.assign(this.endEffects[1], {
            military: CL.NO_REGRESSION,
            industry: News.clHalfRegression(this.endEffects[1].industry),
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Must be at war
        const relationshipValid = planet.culture.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Requires high security to conduct sabotage
        const securityValid = (planet.culture.security > CL.MEDIUM) && (planet.culture.security/targetPlanet.culture.security > CL.HIGH)
        // Can't have sabotage already
        const interferingEvent = News.hasNews(NT.WAR_SABOTAGE, planet, targetPlanet)
        return relationshipValid && hasWar && securityValid && !interferingEvent
    }
}
