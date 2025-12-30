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
                newRelationship: RELATIONSHIP_TYPES.SOVEREIGN,
                civilizationMultipliers: new Civilization({
                    territory: CL.VERY_HIGH,
                    military: CL.SLIGHTLY_LOW,
                    economy: CL.HIGH,
                    reserves: CL.HIGH,
                    prestige: CL.VERY_HIGH
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                newGovernmentType: GT.PUPPET_STATE,
                newRelationship: RELATIONSHIP_TYPES.SUBJECT,
                civilizationMultipliers: new Civilization({
                    territory: CL.VERY_LOW,
                    military: CL.EXTREMELY_LOW,
                    security: CL.VERY_LOW,
                    economy: CL.LOW,
                    reserves: CL.LOW,
                    prestige: CL.VERY_LOW
                }),
                relationsReset: true,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW]])),
                forcePeace: true
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Subjugating others has some lingering effects
        this.completeEffects[0].newRelationship = RELATIONSHIP_TYPES.NEUTRAL
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            territory: CL.SLIGHTLY_HIGH,
            military: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH
        }))
        // Being subjugated has some lingering ill effects
        this.completeEffects[1].newRelationship = RELATIONSHIP_TYPES.NEUTRAL
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            territory: CL.SLIGHTLY_HIGH,
            military: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH
        }))

        // Failed: occupation repelled, attacker loses forces
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            military: CL.LOW,  // Failed invasion losses
            prestige: CL.LOW  // Humiliation
        }))
        this.failEffects[1].civilizationMultipliers.multiply(new Civilization({
            prestige: CL.HIGH,  // Victory boosts morale
            military: CL.SLIGHTLY_LOW  // But fighting took toll
        }))

        // Cancelled: peace forces withdrawal
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            territory: CL.SLIGHTLY_HIGH,
            military: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            territory: CL.SLIGHTLY_HIGH,
            military: CL.SLIGHTLY_HIGH,
            security: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH
        }))
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if war no longer ongoing
        return p.c.relationships.get(tp) !== RELATIONSHIP_TYPES.WAR
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Resistance probability based on target's military strength
        const successProbability = 1 - (tp.militaryPower / p.militaryPower) * 0.3
        this.rollOutcome(successProbability)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //our army must be both large and  significantly better than theirs in every way
        const ratingsValid = (p.c.army/tp.c.army > CL.HIGH) && (p.c.navy/tp.c.navy > CL.HIGH)
        //planet must be at war with the target
        const relationshipValid = p.c.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.SUBJUGATION, ...NT_COOPERATIVE])
        return ratingsValid && relationshipValid && !interferingEvent
    }

}
