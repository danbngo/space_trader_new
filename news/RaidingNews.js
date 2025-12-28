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
                marketCargoAmounts: CL.VERY_HIGH,
                blackMarketCargoAmounts: CL.VERY_HIGH,
                marketPrices: CL.VERY_LOW,
                blackMarketPrices: CL.VERY_LOW,
                territory: CL.SLIGHTLY_HIGH,
                economy: CL.HIGH,
                military: CL.LOW, // diverting forces to raiding weakens defense
                prestige: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                marketCargoAmounts: CL.LOW,
                blackMarketCargoAmounts: CL.LOW,
                credits: CL.LOW,
                security: CL.LOW,
                economy: CL.LOW,
                prestige: CL.LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Raider: market goods normalize back, but economy gains, military loss, and prestige damage linger
        Object.assign(this.endEffects[0], {
            //prestige: CL.NO_REGRESSION,
            economy: News.clHalfRegression(this.endEffects[0].economy),
            military: News.clHalfRegression(this.endEffects[0].military),
            marketPrices: News.clHalfRegression(this.endEffects[0].marketPrices),
            blackMarketPrices: News.clHalfRegression(this.endEffects[0].blackMarketPrices),
            prestige: CL.NO_REGRESSION,
            territory: CL.NO_REGRESSION,
            marketCargoAmounts: CL.NO_REGRESSION,
            blackMarketCargoAmounts: CL.NO_REGRESSION,
        })
        // Victim: permanent loss to market goods and prestige
        Object.assign(this.endEffects[1], {
            marketCargoAmounts: CL.NO_REGRESSION, // goods stolen don't come back
            blackMarketCargoAmounts: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION, // permanent prestige loss from being raided
            credits: News.clHalfRegression(this.endEffects[1].credits),
            security: News.clHalfRegression(this.endEffects[1].security),
        })

        // Failed: raiders repelled, heavy losses
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                military: CL.VERY_LOW, // raiders destroyed
                prestige: CL.VERY_LOW, // humiliation
                economy: CL.NO_REGRESSION, // no plunder gained
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                prestige: CL.HIGH, // victory
                military: News.clHalfRegression(CL.LOW),
            })
        ]

        // Cancelled: peace ends raids early
        this.cancelEndEffects = [
            new NewsEffect({
                planet: this.planet,
                marketCargoAmounts: News.clHalfRegression(CL.VERY_HIGH),
                economy: News.clHalfRegression(CL.HIGH),
                military: News.clHalfRegression(CL.LOW),
                territory: News.clHalfRegression(CL.SLIGHTLY_HIGH),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                marketCargoAmounts: News.clHalfRegression(CL.LOW),
                economy: News.clHalfRegression(CL.LOW),
                security: News.clHalfRegression(CL.LOW),
            })
        ]
    }

    determineEnding() {
        const {planet, targetPlanet} = this
        // Check if peace declared
        const rel = planet.culture.relationships.get(targetPlanet)
        if (rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY) {
            this.cancelled = true
            return
        }
        // Raids fail if target has strong defense
        const failProbability = (targetPlanet.culture.military / planet.culture.military) * 0.3
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet, targetPlanet} = this
        // More likely if military is high and goods are low
        const ratingsValid = planet.culture.military > 1.25 && (planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE < 0.5 || planet.settlement.blackMarket.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE < 0.5)
        // Both parties must be at least TENSE (TENSE or WAR)
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        // Planet must not already have this event
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.RAIDING])
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
