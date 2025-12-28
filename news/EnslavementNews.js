class EnslavementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins enslaving populations from ${coloredName(targetPlanet)}! Forced labor crews arrive in chains!`,
            `${coloredName(planet)} officially ends its slavery programs against ${coloredName(targetPlanet)}.`,
            NEWS_TYPES.ENSLAVEMENT, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                economy: CL.HIGH,
                industry: CL.HIGH,
                population: CL.VERY_HIGH,
                security: CL.VERY_LOW,
                prestige: CL.LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                population: CL.LOW,
                security: CL.LOW,
                guildNumOfficers: CL.LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Enslaver: economy and population gains are permanent, prestige loss lingers
        Object.assign(this.endEffects[0], {
            security: News.clHalfRegression(this.endEffects[0].security),
            prestige: News.clHalfRegression(this.endEffects[0].prestige),
            population: CL.NO_REGRESSION,
            economy: News.clHalfRegression(this.endEffects[0].economy),
            industry: News.clHalfRegression(this.endEffects[0].industry),
        })
        // Victim: permanent population loss, prestige loss
        Object.assign(this.endEffects[1], {
            population: CL.NO_REGRESSION, // stolen population doesn't return
            guildNumOfficers: CL.NO_REGRESSION,
            //prestige: CL.NO_REGRESSION, // permanent shame
            economy: News.clHalfRegression(this.endEffects[1].economy),
            industry: News.clHalfRegression(this.endEffects[1].industry),
            security: News.clHalfRegression(this.endEffects[1].security),
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        // More likely if economy/industry AND population is low (seeking economic boost)
        const ratingsValid = (planet.culture.economy < CL.LOW || planet.culture.industry < CL.LOW) && planet.culture.population < CL.LOW
        // Target must have population to steal
        const targetValid = targetPlanet.culture.population > CL.LOW
        // our military must be stronger than theirs
        const militaryValid = planet.culture.military > targetPlanet.culture.military * CL.HIGH
        // Only authoritarian, police states, or corporate states would enslave
        // Both parties must be at least TENSE (TENSE or WAR)
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        // Must not already have this event between these planets
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.ENSLAVEMENT])
        return ratingsValid && targetValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
