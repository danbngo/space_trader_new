class WarInvasionNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches drop pods and begins a ground invasion of ${coloredName(targetPlanet)}!`,
            `The invasion of ${coloredName(targetPlanet)} concludes with heavy casualties!`,
            '',
            `${coloredName(planet)}'s invasion of ${coloredName(targetPlanet)} is called off! Ceasefire declared!`,
            NT.WAR_INVASION, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    education: CL.LOW,
                    military: CL.SLIGHTLY_LOW
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    security: CL.LOW,
                    economy: CL.LOW,
                    industry: CL.LOW,
                    population: CL.SLIGHTLY_LOW
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: permanent officer losses from invasion
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            education: CL.NO_REGRESSION,
            military: CL.NO_REGRESSION
        }))
        // Defender: even heavier permanent losses
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            education: CL.SLIGHTLY_LOW,  // Defenders advantage?
            military: CL.LOW,
            security: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            industry: CL.SLIGHTLY_HIGH,
            population: CL.SLIGHTLY_HIGH
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            education: CL.SLIGHTLY_HIGH,
            military: CL.SLIGHTLY_HIGH
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            security: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            industry: CL.SLIGHTLY_HIGH,
            population: CL.SLIGHTLY_HIGH
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if peace was forced (relationships changed during invasion)
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
        // Attacker must have ship  AND ground advantage to launch invasion
        const militaryValid = (p.c.navy > tp.c.navy) && (p.c.army > tp.c.army)
        // Can't have invasion already
        const interferingEvent = News.hasNews(NT.WAR_INVASION, planet, targetPlanet)
        return relationshipValid && hasWar && militaryValid && !interferingEvent
    }
}
