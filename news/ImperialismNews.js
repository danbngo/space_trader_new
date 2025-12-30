class ImperialismNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} carries out imperialist expansion, seizing territory from ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s imperialist expansion against ${coloredName(targetPlanet)} finally grinds to a halt!`,
            `${coloredName(targetPlanet)} repels ${coloredName(planet)}'s imperialist aggression!`,
            `Peace treaty forces ${coloredName(planet)} to abandon expansion into ${coloredName(targetPlanet)}!`,
            NT.IMPERIALISM, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                army: CL.LOW,
                navy: CL.LOW,
                security: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                army: CL.LOW,
                navy: CL.LOW,
                prestige: CL.LOW,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())

        //aggressor gains territory, some lingering drops
        Object.assign(this.completeEffects[0], {
            territory: CL.HIGH,
            prestige: News.clHalfRegression(this.completeEffects[0].prestige),
            security: News.clHalfRegression(this.completeEffects[0].security),
            army: News.clHalfRegression(this.completeEffects[0].army),
            navy: News.clHalfRegression(this.completeEffects[0].navy),
        })
        //victim recovers partially
        Object.assign(this.completeEffects[1], {
            territory: CL.LOW,
            prestige: CL.NO_REGRESSION,
        })

        // Failed: expansion repelled, aggressor humiliated
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                army: CL.NO_REGRESSION, // losses remain
                navy: CL.NO_REGRESSION,
                security: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW, // failed expansion
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                army: News.clHalfRegression(CL.LOW),
                navy: News.clHalfRegression(CL.LOW),
                prestige: CL.HIGH, // victory boosts morale
            })
        ]

        // Cancelled: peace forces withdrawal
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                army: News.clHalfRegression(CL.LOW),
                navy: News.clHalfRegression(CL.LOW),
                security: News.clHalfRegression(CL.LOW),
                territory: News.clHalfRegression(CL.HIGH), // partial gains
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                army: News.clHalfRegression(CL.LOW),
                navy: News.clHalfRegression(CL.LOW),
                territory: News.clHalfRegression(CL.LOW), // partial losses
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
        // Expansion fails if target resists successfully
        const resistanceProbability = (targetPlanet.militaryPower / planet.militaryPower) * 0.35
        this.failed = Math.random() < resistanceProbability
    }

    isValid() {
        const {planet, targetPlanet} = this
        //aggressor needs high military and low territory, victim needs territory to take
        const ratingsValid = (planet.civilization.military > CL.SLIGHTLY_HIGH) && (planet.civilization.territory < CL.HIGH) && (targetPlanet.civilization.territory > CL.SLIGHTLY_LOW)
        //aggressor must have at least 1.5x the military of victim
        const militaryValid = planet.civilization.military >= targetPlanet.civilization.military * CL.HIGH
        //both must have tensions with each other
        const relationships = [planet.civilization.relationships.get(targetPlanet), targetPlanet.civilization.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        const interferingEvent =
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.IMPERIALISM])
        return ratingsValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
