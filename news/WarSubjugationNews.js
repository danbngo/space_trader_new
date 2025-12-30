class WarSubjugationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} lands its ships and occupies ${coloredName(targetPlanet)}! Its armies raise the flag of ${coloredName(planet)} over the conquered world.`,
            `${coloredName(targetPlanet)} regains independence from ${coloredName(planet)}, bringing the occupation to an end!`,
            `${coloredName(targetPlanet)} mounts fierce resistance and repels ${coloredName(planet)}'s occupation forces!`,
            `Peace treaty forces ${coloredName(planet)} to abandon occupation of ${coloredName(targetPlanet)}!`,
            NT.SUBJUGATION, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.SOVEREIGN,
                territory: CL.VERY_HIGH,
                army: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
                economy: CL.HIGH,
                reserves: CL.HIGH,
                prestige: CL.VERY_HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newGovernmentType: GT.PUPPET_STATE,
                newRelationship: RELATIONSHIP_TYPES.SUBJECT,
                territory: CL.VERY_LOW,
                army: CL.EXTREMELY_LOW,
                navy: CL.EXTREMELY_LOW,
                security: CL.VERY_LOW,
                economy: CL.LOW,
                reserves: CL.LOW,
                prestige: CL.VERY_LOW,
                relationsReset: true,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW]]),
                forcePeace: true,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //subjugating others has some lingering effects on territory, military, prestige
        Object.assign(this.completeEffects[0], {
            territory: News.clHalfRegression(this.completeEffects[0].territory),
            army: News.clHalfRegression(this.completeEffects[0].army),
            navy: News.clHalfRegression(this.completeEffects[0].navy),
            prestige: News.clHalfRegression(this.completeEffects[0].prestige),
            newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
        })
        //being subjugated has some lingering ill effects on territory, military, prestige
        Object.assign(this.completeEffects[1], {
            territory: News.clHalfRegression(this.completeEffects[1].territory),
            army: News.clHalfRegression(this.completeEffects[1].army),
            navy: News.clHalfRegression(this.completeEffects[1].navy),
            prestige: News.clHalfRegression(this.completeEffects[0].prestige),
            newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
        })

        // Failed: occupation repelled, attacker loses forces
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                army: CL.LOW, // failed invasion losses
                navy: CL.LOW,
                prestige: CL.LOW, // humiliation
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                prestige: CL.HIGH, // victory boosts morale
                army: News.clHalfRegression(CL.EXTREMELY_LOW), // but fighting took toll
                navy: News.clHalfRegression(CL.EXTREMELY_LOW),
            })
        ]

        // Cancelled: peace forces withdrawal
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                territory: News.clHalfRegression(CL.VERY_HIGH),
                army: News.clHalfRegression(CL.SLIGHTLY_LOW),
                navy: News.clHalfRegression(CL.SLIGHTLY_LOW),
                economy: News.clHalfRegression(CL.HIGH),
                prestige: News.clHalfRegression(CL.VERY_HIGH),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                territory: News.clHalfRegression(CL.VERY_LOW),
                army: News.clHalfRegression(CL.EXTREMELY_LOW),
                navy: News.clHalfRegression(CL.EXTREMELY_LOW),
                security: News.clHalfRegression(CL.VERY_LOW),
                economy: News.clHalfRegression(CL.LOW),
                prestige: News.clHalfRegression(CL.VERY_LOW),
            })
        ]
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if war still ongoing
        const stillAtWar = planet.civilization.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        if (!stillAtWar) {
            this.cancelled = true
            return
        }
        // Resistance probability based on target's military strength relative to occupier
        const resistanceProbability = (targetPlanet.militaryPower / planet.militaryPower) * 0.3
        this.failed = Math.random() < resistanceProbability
    }

    isValid() {
        const {planet, targetPlanet} = this
        //our army must be both large and  significantly better than theirs in every way
        const ratingsValid = (planet.civilization.army/targetPlanet.civilization.army > CL.HIGH) && (planet.civilization.navy/targetPlanet.civilization.navy > CL.HIGH)
        //planet must be at war with the target
        const relationshipValid = planet.civilization.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.SUBJUGATION, ...NT_COOPERATIVE])
        return ratingsValid && relationshipValid && !interferingEvent
    }

}
