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
                civilizationMultipliers: new Civilization({
                    security: CL.LOW,  // Agents deployed
                    education: CL.LOW  // Agents/spies
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    military: CL.SLIGHTLY_LOW,  // Sabotaged military infrastructure
                    industry: CL.LOW  // Factories bombed
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: agents lost permanently
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            security: CL.NO_REGRESSION,  // Security apparatus damaged
            education: CL.NO_REGRESSION  // Agents don't return
        }))
        // Defender: permanent damage from sabotage
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            military: CL.NO_REGRESSION,
            industry: CL.SLIGHTLY_HIGH
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            security: CL.SLIGHTLY_HIGH,
            education: CL.SLIGHTLY_HIGH
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            military: CL.SLIGHTLY_HIGH,
            industry: CL.SLIGHTLY_HIGH
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
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
