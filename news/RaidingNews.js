class RaidingNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches raids on ${coloredName(targetPlanet)}! Plundered goods flood their markets!`,
            `${coloredName(planet)} ceases its raiding operations against ${coloredName(targetPlanet)}!`,
            `${coloredName(targetPlanet)} repels ${coloredName(planet)}'s raiders, inflicting heavy losses!`,
            `Peace treaty forces ${coloredName(planet)} to end raids on ${coloredName(targetPlanet)}!`,
            NT.RAIDING, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    reserves: CL.VERY_HIGH,
                    crime: CL.VERY_HIGH,
                    inflation: CL.VERY_LOW,
                    corruption: CL.VERY_LOW,
                    territory: CL.SLIGHTLY_HIGH,
                    economy: CL.HIGH,
                    military: CL.LOW,  // Diverting forces to raiding weakens defense
                    prestige: CL.SLIGHTLY_LOW
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    reserves: CL.LOW,
                    crime: CL.LOW,
                    wealth: CL.LOW,
                    security: CL.LOW,
                    economy: CL.LOW,
                    prestige: CL.LOW
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Raider: market goods normalize back, but economy gains, military loss, and prestige damage linger
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            economy: CL.SLIGHTLY_HIGH,
            military: CL.SLIGHTLY_LOW,
            inflation: CL.SLIGHTLY_HIGH,
            corruption: CL.SLIGHTLY_HIGH,
            prestige: CL.NO_REGRESSION,
            territory: CL.NO_REGRESSION,
            reserves: CL.NO_REGRESSION,
            crime: CL.NO_REGRESSION
        }))
        // Victim: permanent loss to market goods and prestige
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            reserves: CL.NO_REGRESSION,  // Goods stolen don't come back
            crime: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION,  // Permanent prestige loss from being raided
            wealth: CL.SLIGHTLY_LOW,
            security: CL.SLIGHTLY_LOW
        }))

        // Failed: raiders repelled, heavy losses
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            military: CL.VERY_LOW,  // Raiders destroyed
            prestige: CL.VERY_LOW,  // Humiliation
            economy: CL.NO_REGRESSION  // No plunder gained
        }))
        this.failEffects[1].civilizationMultipliers.multiply(new Civilization({
            prestige: CL.HIGH,  // Victory
            military: CL.SLIGHTLY_LOW
        }))

        // Cancelled: peace ends raids early
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            reserves: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            military: CL.SLIGHTLY_LOW,
            territory: CL.SLIGHTLY_HIGH
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            reserves: CL.SLIGHTLY_LOW,
            economy: CL.SLIGHTLY_LOW,
            security: CL.SLIGHTLY_LOW
        }))
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if peace declared
        const rel = p.c.relationships.get(tp)
        return rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Raids succeed unless target has strong defense
        const successProbability = 1 - (tp.c.military / p.c.military) * 0.3
        this.rollOutcome(successProbability)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // More likely if military is high and goods are low
        const ratingsValid = p.c.military > 1.25 && (planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE < 0.5 || planet.settlement.cryme < 0.5)
        // Both parties must be at least TENSE (TENSE or WAR)
        const relationships = [p.c.relationships.get(targetPlanet), tp.c.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        // Planet must not already have this event
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.RAIDING])
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
