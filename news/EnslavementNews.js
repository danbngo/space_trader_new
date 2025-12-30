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
                civilizationMultipliers: new Civilization({
                    economy: CL.HIGH,
                    industry: CL.HIGH,
                    population: CL.VERY_HIGH,
                    security: CL.VERY_LOW,
                    prestige: CL.LOW,
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                civilizationMultipliers: new Civilization({
                    population: CL.LOW,
                    security: CL.LOW,
                    education: CL.LOW,
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            security: CL.SLIGHTLY_LOW,
            prestige: CL.SLIGHTLY_LOW,
            population: CL.VERY_HIGH, // keep population gains
            economy: CL.SLIGHTLY_HIGH,
            industry: CL.SLIGHTLY_HIGH,
        }))
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            population: CL.LOW, // permanent population loss
            education: CL.LOW, // permanent education loss
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.LOW,
            security: CL.VERY_LOW,
            economy: CL.LOW,
            industry: CL.LOW,
            prestige: CL.VERY_LOW,
        }))
        this.failEffects[1].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_LOW,
            prestige: CL.HIGH,
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            industry: CL.SLIGHTLY_HIGH,
            security: CL.SLIGHTLY_LOW,
            prestige: CL.SLIGHTLY_LOW,
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_LOW,
        }))
    }

    shouldCancel() {
        const rel = this.planet.c.relationships.get(this.targetPlanet)
        return rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.security)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // More likely if economy/industry AND population is low (seeking economic boost)
        const ratingsValid = (p.c.economy < CL.LOW || p.c.industry < CL.LOW) && p.c.population < CL.MEDIUM
        // Target must have population to steal
        const targetValid = targetPlanet.c.population > CL.LOW
        // our military must be stronger than theirs
        const militaryValid = p.c.military > targetPlanet.c.military * CL.HIGH
        // Both parties must be at least TENSE (TENSE or WAR)
        const relationships = [p.c.relationships.get(targetPlanet), targetPlanet.c.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        // Must not already have this event between these planets
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.ENSLAVEMENT])
        return ratingsValid && targetValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
