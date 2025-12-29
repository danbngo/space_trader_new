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
                guildNumOfficers: CL.LOW,
                shipyardNumShips: CL.SLIGHTLY_LOW,
                officerQuality: CL.SLIGHTLY_LOW, //meat grinder
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

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: permanent officer losses from invasion
        Object.assign(this.endEffects[0], {
            guildNumOfficers: CL.NO_REGRESSION,
            shipyardNumShips: CL.NO_REGRESSION,
            officerQuality: CL.NO_REGRESSION,
        })
        // Defender: even heavier permanent losses
        Object.assign(this.endEffects[1], {
            guildNumOfficers: CL.SLIGHTLY_LOW, // defenders advantage?
            shipyardNumShips: CL.SLIGHTLY_LOW,
            officerQuality: CL.SLIGHTLY_LOW,
            security: News.clHalfRegression(this.endEffects[1].security),
            economy: News.clHalfRegression(this.endEffects[1].economy),
            industry: News.clHalfRegression(this.endEffects[1].industry),
            population: News.clHalfRegression(this.endEffects[1].population),
            military: CL.LOW,
        })

        this.cancelEndEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                guildNumOfficers: News.clHalfRegression(this.endEffects[0].guildNumOfficers),
                shipyardNumShips: News.clHalfRegression(this.endEffects[0].shipyardNumShips),
                officerQuality: News.clHalfRegression(this.endEffects[0].officerQuality),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                security: News.clHalfRegression(this.endEffects[1].security),
                economy: News.clHalfRegression(this.endEffects[1].economy),
                industry: News.clHalfRegression(this.endEffects[1].industry),
                population: News.clHalfRegression(this.endEffects[1].population),
            })
        ]
    }

    determineEnding() {
        const {planet, targetPlanet} = this
        // Check if peace was forced (relationships changed during invasion)
        const currentRel1 = planet.culture.relationships.get(targetPlanet)
        const currentRel2 = targetPlanet.culture.relationships.get(planet)
        this.cancelled = (currentRel1 !== RELATIONSHIP_TYPES.WAR || currentRel2 !== RELATIONSHIP_TYPES.WAR)
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Must be at war
        const relationshipValid = planet.culture.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Attacker must have ship  AND ground advantage to launch invasion
        const militaryValid = (planet.navy > targetPlanet.navy) && (planet.army > targetPlanet.army)
        // Can't have invasion already
        const interferingEvent = News.hasNews(NT.WAR_INVASION, planet, targetPlanet)
        return relationshipValid && hasWar && militaryValid && !interferingEvent
    }
}
