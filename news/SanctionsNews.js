class SanctionsNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} imposes economic sanctions on ${coloredName(targetPlanet)}, damaging both economies!`,
            `${coloredName(planet)}'s sanctions on ${coloredName(targetPlanet)} have been lifted!`,
            `${coloredName(planet)}'s sanctions on ${coloredName(targetPlanet)} backfire, causing more domestic harm!`,
            `${coloredName(planet)} ends sanctions on ${coloredName(targetPlanet)} as relations normalize!`,
            NT.SANCTIONS, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    reserves: CL.LOW,
                    economy: CL.LOW,
                    wealth: CL.SLIGHTLY_LOW
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    reserves: CL.VERY_LOW,
                    economy: CL.VERY_LOW,
                    education: CL.LOW,
                    wealth: CL.LOW
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Some lingering damage after
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            economy: CL.SLIGHTLY_LOW,
            wealth: CL.SLIGHTLY_LOW
        }))
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            economy: CL.SLIGHTLY_LOW
        }))

        // Failed: sanctions backfire, hurt sanctioner more
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            economy: CL.VERY_LOW,  // Domestic economic crisis
            wealth: CL.LOW,
            prestige: CL.LOW  // Policy failure
        }))
        this.failEffects[1].civilizationMultipliers.multiply(new Civilization({
            economy: CL.SLIGHTLY_LOW  // Partial damage
        }))

        // Cancelled: relations improve, sanctions dropped
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            reserves: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            wealth: CL.SLIGHTLY_HIGH
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            reserves: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            wealth: CL.SLIGHTLY_HIGH
        }))
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if relationship improved
        const rel = p.c.relationships.get(tp)
        return rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Sanctions succeed unless sanctioner's economy weakens too much
        this.rollOutcome(p.c.economy * 0.7 + 0.3)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //we need a strong economy to pull it off
        const ratingsValid = p.c.economy > CL.HIGH && p.c.wealth >= CL.HIGH
        //aggressor must be hostile towards victim
        const aggressorRelationship = p.c.relationships.get(targetPlanet)
        const relationshipsValid = aggressorRelationship == RELATIONSHIP_TYPES.TENSE
        //blocked if already at war or other hostile actions
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.SANCTIONS, ...NT_COOPERATIVE])
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
