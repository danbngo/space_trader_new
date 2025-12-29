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
                targetPlanet: this.targetPlanet,
                labor: CL.LOW,
                ships: CL.SLIGHTLY_LOW,
                education: CL.SLIGHTLY_LOW, //meat grinder
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                security: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                population: CL.SLIGHTLY_LOW,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: permanent officer losses from invasion
        Object.assign(this.completeEffects[0], {
            labor: CL.NO_REGRESSION,
            ships: CL.NO_REGRESSION,
            education: CL.NO_REGRESSION,
        })
        // Defender: even heavier permanent losses
        Object.assign(this.completeEffects[1], {
            labor: CL.SLIGHTLY_LOW, // defenders advantage?
            ships: CL.SLIGHTLY_LOW,
            education: CL.SLIGHTLY_LOW,
            security: News.clHalfRegression(this.completeEffects[1].security),
            economy: News.clHalfRegression(this.completeEffects[1].economy),
            industry: News.clHalfRegression(this.completeEffects[1].industry),
            population: News.clHalfRegression(this.completeEffects[1].population),
            military: CL.LOW,
        })

        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                labor: News.clHalfRegression(this.completeEffects[0].labor),
                ships: News.clHalfRegression(this.completeEffects[0].ships),
                education: News.clHalfRegression(this.completeEffects[0].education),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                security: News.clHalfRegression(this.completeEffects[1].security),
                economy: News.clHalfRegression(this.completeEffects[1].economy),
                industry: News.clHalfRegression(this.completeEffects[1].industry),
                population: News.clHalfRegression(this.completeEffects[1].population),
            })
        ]
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if peace was forced (relationships changed during invasion)
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
        // Attacker must have ship  AND ground advantage to launch invasion
        const militaryValid = (planet.navy > targetPlanet.navy) && (planet.army > targetPlanet.army)
        // Can't have invasion already
        const interferingEvent = News.hasNews(NT.WAR_INVASION, planet, targetPlanet)
        return relationshipValid && hasWar && militaryValid && !interferingEvent
    }
}
