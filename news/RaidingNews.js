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
                targetPlanet: this.targetPlanet,
                reserves: CL.VERY_HIGH,
                crime: CL.VERY_HIGH,
                inflation: CL.VERY_LOW,
                corruption: CL.VERY_LOW,
                territory: CL.SLIGHTLY_HIGH,
                economy: CL.HIGH,
                army: CL.LOW, // diverting forces to raiding weakens defense
                navy: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                reserves: CL.LOW,
                crime: CL.LOW,
                wealth: CL.LOW,
                security: CL.LOW,
                economy: CL.LOW,
                prestige: CL.LOW,
            })
        ]
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Raider: market goods normalize back, but economy gains, military loss, and prestige damage linger
        Object.assign(this.completeEffects[0], {
            //prestige: CL.NO_REGRESSION,
            economy: News.clHalfRegression(this.completeEffects[0].economy),
            army: News.clHalfRegression(this.completeEffects[0].army),
            navy: News.clHalfRegression(this.completeEffects[0].navy),
            inflation: News.clHalfRegression(this.completeEffects[0].inflation),
            corruption: News.clHalfRegression(this.completeEffects[0].corruption),
            prestige: CL.NO_REGRESSION,
            territory: CL.NO_REGRESSION,
            reserves: CL.NO_REGRESSION,
            crime: CL.NO_REGRESSION,
        })
        // Victim: permanent loss to market goods and prestige
        Object.assign(this.completeEffects[1], {
            reserves: CL.NO_REGRESSION, // goods stolen don't come back
            crime: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION, // permanent prestige loss from being raided
            wealth: News.clHalfRegression(this.completeEffects[1].wealth),
            security: News.clHalfRegression(this.completeEffects[1].security),
        })

        // Failed: raiders repelled, heavy losses
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                army: CL.VERY_LOW, // raiders destroyed
                navy: CL.VERY_LOW,
                prestige: CL.VERY_LOW, // humiliation
                economy: CL.NO_REGRESSION, // no plunder gained
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                prestige: CL.HIGH, // victory
                army: News.clHalfRegression(CL.LOW),
                navy: News.clHalfRegression(CL.LOW),
            })
        ]

        // Cancelled: peace ends raids early
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                reserves: News.clHalfRegression(CL.VERY_HIGH),
                economy: News.clHalfRegression(CL.HIGH),
                army: News.clHalfRegression(CL.LOW),
                navy: News.clHalfRegression(CL.LOW),
                territory: News.clHalfRegression(CL.SLIGHTLY_HIGH),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                reserves: News.clHalfRegression(CL.LOW),
                economy: News.clHalfRegression(CL.LOW),
                security: News.clHalfRegression(CL.LOW),
            })
        ]
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if peace declared
        const rel = p.c.relationships.get(targetPlanet)
        if (rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY) {
            this.cancelled = true
            return
        }
        // Raids fail if target has strong defense
        const failProbability = (targetPlanet.c.military / p.c.military) * 0.3
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // More likely if military is high and goods are low
        const ratingsValid = p.c.military > 1.25 && (planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE < 0.5 || planet.settlement.cryme < 0.5)
        // Both parties must be at least TENSE (TENSE or WAR)
        const relationships = [p.c.relationships.get(targetPlanet), targetPlanet.c.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        // Planet must not already have this event
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.RAIDING])
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
