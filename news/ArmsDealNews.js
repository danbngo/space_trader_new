class ArmsDealNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} pursues a major arms purchase from ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s arms deal with ${coloredName(targetPlanet)} is complete!`,
            `${coloredName(targetPlanet)} refuses to sell arms to ${coloredName(planet)} due to their poor reputation!`,
            `${coloredName(planet)} cancels arms deal with ${coloredName(targetPlanet)} due to deteriorating relations!`,
            NT.ARMS_DEAL, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                prestige: CL.SLIGHTLY_LOW,
            }),
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            credits: CL.LOW,
            military: CL.HIGH, //gain some knowledge, new sytems etc.
            shipyardNumShips: CL.HIGH,
            blackMarketCargoAmounts: CL.HIGH,
            blackMarketPrices: CL.LOW,
        })
        Object.assign(this.endEffects[1], {
            credits: CL.HIGH,
            shipyardNumShips: CL.LOW,
            blackMarketCargoAmounts: CL.LOW,
            blackMarketPrices: CL.HIGH,
        })

        // Failed: seller refuses to sell
        this.failEndEffects = []

        // Cancelled: deal cancelled midway
        this.cancelEndEffects = []
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
        const prestigeFactor = planet.culture.prestige
        const creditsFactor = planet.settlement.bank.baseCredits/
        const refusalProbability = (prestigeFactor * 0.15 + creditsFactor * 0.15) * Math.random()
        this.failed = refusalProbability > 0.15
    }

    isValid() {
        const {planet, targetPlanet} = this
        //targetPlanet (seller) needs to have sufficient military to sell
        const ratingsValid = (targetPlanet.culture.military >= CL.HIGH || targetPlanet.navy > CL.HIGH) && targetPlanet.settlement.illegalGoods > CL.MEDIUM
        //seller's military should be larger than purchaser's
        const transferValid = targetPlanet.culture.military > planet.culture.military && targetPlanet.navy > planet.navy
        //both planets must be neutral or allies
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL || rel == RELATIONSHIP_TYPES.ALLY)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.ARMS_DEAL, ...NT_COOPERATION_PREVENTING])
        return transferValid && ratingsValid && relationshipsValid && !interferingEvent
    }
}
