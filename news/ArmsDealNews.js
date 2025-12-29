class ArmsDealNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} pursues a major arms purchase from ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s arms deal with ${coloredName(targetPlanet)} is complete!`,
            `${coloredName(targetPlanet)} refuses to sell arms to ${coloredName(planet)}!`,
            `${coloredName(planet)} cancels arms deal with ${coloredName(targetPlanet)} due to deteriorating relations!`,
            NT.ARMS_DEAL, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                credits: CL.LOW,
                military: CL.HIGH,
                shipyardNumShips: CL.HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                military: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.SLIGHTLY_LOW], [CARGO_TYPES.ANTIMATTER, CL.SLIGHTLY_LOW]]),
                shipyardNumShips: CL.LOW,
                blackMarketCargoAmounts: CL.LOW,
                blackMarketPrices: CL.HIGH,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            credits: CL.NO_REGRESSION,
            military: News.clHalfRegression(this.endEffects[0].military),
            shipyardNumShips: News.clHalfRegression(this.endEffects[0].shipyardNumShips),
            blackMarketCargoAmounts: CL.HIGH,
            blackMarketPrices: CL.LOW,
        })
        Object.assign(this.endEffects[1], {
            military: News.clHalfRegression(this.endEffects[1].military),
            shipyardNumShips: News.clHalfRegression(this.endEffects[1].shipyardNumShips),
            prestige: CL.SLIGHTLY_HIGH,
            credits: CL.HIGH,
            blackMarketCargoAmounts: CL.NO_REGRESSION,
            blackMarketPrices: CL.NO_REGRESSION,
        })

        // Failed: seller refuses to sell
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                credits: CL.NO_REGRESSION, // kept credits but no weapons
                prestige: CL.LOW, // rejected and embarrassed
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                military: CL.NO_REGRESSION, // kept weapons
                shipyardNumShips: CL.NO_REGRESSION,
                prestige: CL.SLIGHTLY_HIGH, // asserted power by refusing
            })
        ]

        // Cancelled: deal cancelled midway
        this.cancelEndEffects = [
            new NewsEffect({
                planet: this.planet,
                credits: News.clHalfRegression(CL.LOW), // partial refund
                military: News.clHalfRegression(CL.HIGH),
                shipyardNumShips: News.clHalfRegression(CL.HIGH),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                military: News.clHalfRegression(CL.LOW),
                shipyardNumShips: News.clHalfRegression(CL.LOW),
                credits: News.clHalfRegression(CL.HIGH), // partial payment
                prestige: News.clHalfRegression(CL.SLIGHTLY_HIGH),
            })
        ]
    }

    determineEnding() {
        const {planet, targetPlanet} = this
        // Check if relationship deteriorated
        const rel1 = planet.culture.relationships.get(targetPlanet)
        const rel2 = targetPlanet.culture.relationships.get(planet)
        if (rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.WAR ||
            rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.WAR) {
            this.cancelled = true
            return
        }
        // Fail if targetPlanet refuses to sell - based on planet's low prestige/credits
        // Lower prestige and credits increase the chance seller refuses
        const prestigeFactor = 1 - planet.culture.prestige
        const creditsFactor = 1 - planet.settlement.bank.credits / 1000000 // normalize to reasonable scale
        const refusalProbability = (prestigeFactor * 0.15 + creditsFactor * 0.15) * Math.random()
        this.failed = refusalProbability > 0.15
    }

    isValid() {
        const {planet, targetPlanet} = this
        //targetPlanet (seller) needs to have sufficient military to sell
        const ratingsValid = (targetPlanet.culture.military >= CL.HIGH || targetPlanet.settlement.shipyard.baseNumShips > CL.HIGH) && targetPlanet.settlement.blackMarket.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE > CL.MEDIUM
        //seller's military should be larger than purchaser's
        const transferValid = targetPlanet.culture.military > planet.culture.military && targetPlanet.settlement.shipyard.baseNumShips > planet.settlement.shipyard.baseNumShips
        //both planets must be neutral or allies
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL || rel == RELATIONSHIP_TYPES.ALLY)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.ARMS_DEAL, ...NT_COOPERATION_PREVENTING])
        return transferValid && ratingsValid && relationshipsValid && !interferingEvent
    }
}
