class ArmsDealNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends a major arms shipment to ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s arms deal with ${coloredName(targetPlanet)} is complete!`,
            `Arms shipment from ${coloredName(planet)} to ${coloredName(targetPlanet)} is intercepted by pirates!`,
            `${coloredName(planet)} cancels arms deal with ${coloredName(targetPlanet)} due to deteriorating relations!`,
            NT.ARMS_DEAL, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                military: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.SLIGHTLY_LOW], [CARGO_TYPES.ANTIMATTER, CL.SLIGHTLY_LOW]]),
                shipyardNumShips: CL.LOW,
                blackMarketCargoAmounts: CL.LOW,
                blackMarketPrices: CL.HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                credits: CL.LOW,
                military: CL.HIGH,
                shipyardNumShips: CL.HIGH,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            military: News.clHalfRegression(this.endEffects[0].military),
            shipyardNumShips: News.clHalfRegression(this.endEffects[0].shipyardNumShips),
            prestige: CL.SLIGHTLY_HIGH,
            credits: CL.HIGH,
            blackMarketCargoAmounts: CL.NO_REGRESSION,
            blackMarketPrices: CL.NO_REGRESSION,
        })
        Object.assign(this.endEffects[1], {
            credits: CL.NO_REGRESSION,
            military: News.clHalfRegression(this.endEffects[1].military),
            shipyardNumShips: News.clHalfRegression(this.endEffects[1].shipyardNumShips),
            blackMarketCargoAmounts: CL.HIGH,
            blackMarketPrices: CL.LOW,
        })

        // Failed: shipment intercepted, both sides lose
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                military: CL.NO_REGRESSION, // weapons lost
                shipyardNumShips: CL.NO_REGRESSION,
                prestige: CL.LOW, // failure to deliver
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                credits: CL.NO_REGRESSION, // paid but got nothing
                prestige: CL.LOW, // frustration
            })
        ]

        // Cancelled: deal cancelled midway
        this.cancelEndEffects = [
            new NewsEffect({
                planet: this.planet,
                military: News.clHalfRegression(CL.LOW),
                shipyardNumShips: News.clHalfRegression(CL.LOW),
                credits: News.clHalfRegression(CL.HIGH), // partial payment
                prestige: News.clHalfRegression(CL.SLIGHTLY_HIGH),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                credits: News.clHalfRegression(CL.LOW), // partial refund
                military: News.clHalfRegression(CL.HIGH),
                shipyardNumShips: News.clHalfRegression(CL.HIGH),
            })
        ]
    }

    determineEnding() {
        const {planet, targetPlanet} = this
        // Check if relationship deteriorated
        const rel1 = planet.culture.relationships.get(targetPlanet)
        const rel2 = targetPlanet.culture.relationships.get(planet)
        if (rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.HOSTILE || rel1 === RELATIONSHIP_TYPES.WAR ||
            rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.HOSTILE || rel2 === RELATIONSHIP_TYPES.WAR) {
            this.cancelled = true
            return
        }
        // Fail if security is very low (piracy)
        const avgSecurity = (planet.culture.security + targetPlanet.culture.security) / 2
        const failProbability = (1 - avgSecurity) * 0.25
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet, targetPlanet} = this
        //need to have sufficient military of our own
        const ratingsValid = (planet.culture.military >= CL.HIGH || planet.settlement.shipyard.baseNumShips > CL.HIGH) && planet.settlement.blackMarket.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE > CL.MEDIUM
        //our military should be larger than theirs
        const transferValid = planet.culture.military > targetPlanet.culture.military && planet.settlement.shipyard.baseNumShips > targetPlanet.settlement.shipyard.baseNumShips
        //both planets must be neutral or allies
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL || rel == RELATIONSHIP_TYPES.ALLY)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.ARMS_DEAL, ...NT_COOPERATION_PREVENTING])
        return transferValid && ratingsValid && relationshipsValid && !interferingEvent
    }
}
