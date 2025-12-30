class WarSabotageNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches covert sabotage operations against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s sabotage campaign against ${coloredName(targetPlanet)} concludes!`,
            '',
            `${coloredName(planet)}'s sabotage operations against ${coloredName(targetPlanet)} are called off!`,
            NT.WAR_SABOTAGE, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                security: CL.LOW, // agents deployed
                education: CL.LOW, // agents/spies
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                army: CL.LOW, // sabotaged military infrastructure
                navy: CL.SLIGHTLY_LOW,
                industry: CL.LOW, // factories bombed
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: agents lost permanently
        Object.assign(this.completeEffects[0], {
            security: CL.NO_REGRESSION, // security apparatus damaged
            education: CL.NO_REGRESSION, // agents don't return
        })
        // Defender: permanent damage from sabotage
        Object.assign(this.completeEffects[1], {
            army: CL.NO_REGRESSION,
            navy: CL.NO_REGRESSION,
            industry: News.clHalfRegression(this.completeEffects[1].industry),
        })

        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                security: News.clHalfRegression(this.completeEffects[0].security),
                education: News.clHalfRegression(this.completeEffects[0].education),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                army: News.clHalfRegression(this.completeEffects[1].army),
                navy: News.clHalfRegression(this.completeEffects[1].navy),
                industry: News.clHalfRegression(this.completeEffects[1].industry),
            })
        ]
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if peace was forced during sabotage
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
        // Requires high security to conduct sabotage
        const securityValid = (planet.civilization.security > CL.MEDIUM) && (planet.civilization.security/targetPlanet.civilization.security > CL.HIGH)
        // Can't have sabotage already
        const interferingEvent = News.hasNews(NT.WAR_SABOTAGE, planet, targetPlanet)
        return relationshipValid && hasWar && securityValid && !interferingEvent
    }
}
