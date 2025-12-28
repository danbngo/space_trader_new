class WarInvasionNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches drop pods and begins a ground invasion of ${coloredName(targetPlanet)}!`,
            `The invasion of ${coloredName(targetPlanet)} concludes with heavy casualties!`,
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
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Must be at war
        const relationshipValid = planet.culture.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Attacker must have ship  AND ground advantage to launch invasion
        const militaryValid = (planet.navyPower > targetPlanet.navyPower) && (planet.armyPower > targetPlanet.armyPower)
        // Can't have invasion already
        const interferingEvent = News.hasNews(NT.WAR_INVASION, planet, targetPlanet)
        return relationshipValid && hasWar && militaryValid && !interferingEvent
    }
}
