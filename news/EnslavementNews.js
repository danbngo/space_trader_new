class EnslavementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins enslaving populations from ${coloredName(targetPlanet)}! Forced labor crews arrive in chains!`,
            `${coloredName(planet)} officially ends its slavery programs against ${coloredName(targetPlanet)}.`,
            `Slave revolts in ${coloredName(planet)} force end to enslavement of ${coloredName(targetPlanet)}'s people!`,
            `Peace treaty forces ${coloredName(planet)} to free enslaved populations from ${coloredName(targetPlanet)}!`,
            NT.ENSLAVEMENT, planet, targetPlanet
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
                education: CL.LOW,
            })
        ]
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Enslaver: economy and population gains are permanent, prestige loss lingers
        Object.assign(this.completeEffects[0], {
            security: News.clHalfRegression(this.completeEffects[0].security),
            prestige: News.clHalfRegression(this.completeEffects[0].prestige),
            population: CL.NO_REGRESSION,
            economy: News.clHalfRegression(this.completeEffects[0].economy),
            industry: News.clHalfRegression(this.completeEffects[0].industry),
        })
        // Victim: permanent population loss, prestige loss
        Object.assign(this.completeEffects[1], {
            population: CL.NO_REGRESSION, // stolen population doesn't return
            education: CL.NO_REGRESSION,
            //prestige: CL.NO_REGRESSION, // permanent shame
            economy: News.clHalfRegression(this.completeEffects[1].economy),
            industry: News.clHalfRegression(this.completeEffects[1].industry),
            security: News.clHalfRegression(this.completeEffects[1].security),
        })

        // Failed: slave revolts
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW, // casualties in revolts
                security: CL.VERY_LOW, // civil unrest
                economy: CL.LOW, // disruption
                industry: CL.LOW,
                prestige: CL.VERY_LOW, // humanitarian crisis
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                population: News.clHalfRegression(CL.LOW), // some freed slaves return
                prestige: CL.HIGH, // liberation celebrated
            })
        ]

        // Cancelled: peace forces liberation
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                population: News.clHalfRegression(CL.VERY_HIGH),
                economy: News.clHalfRegression(CL.HIGH),
                industry: News.clHalfRegression(CL.HIGH),
                security: News.clHalfRegression(CL.VERY_LOW),
                prestige: News.clHalfRegression(CL.LOW),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                population: News.clHalfRegression(CL.LOW), // partial return
            })
        ]
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if peace declared
        const rel = planet.civilization.relationships.get(targetPlanet)
        if (rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY) {
            this.cancelled = true
            return
        }
        // Slavery fails if security too low (revolts)
        const revoltProbability = (1 - planet.civilization.security) * 0.45
        this.failed = Math.random() < revoltProbability
    }

    isValid() {
        const {planet, targetPlanet} = this
        // More likely if economy/industry AND population is low (seeking economic boost)
        const ratingsValid = (planet.civilization.economy < CL.LOW || planet.civilization.industry < CL.LOW) && planet.civilization.population < CL.MEDIUM
        // Target must have population to steal
        const targetValid = targetPlanet.civilization.population > CL.LOW
        // our military must be stronger than theirs
        const militaryValid = planet.civilization.military > targetPlanet.civilization.military * CL.HIGH
        // Both parties must be at least TENSE (TENSE or WAR)
        const relationships = [planet.civilization.relationships.get(targetPlanet), targetPlanet.civilization.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        // Must not already have this event between these planets
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.ENSLAVEMENT])
        return ratingsValid && targetValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
