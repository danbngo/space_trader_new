class InvestmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends a massive economic investment to ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s economic investment in ${coloredName(targetPlanet)} is complete!`,
            NT.INVESTMENT, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                credits: CL.LOW,
                marketCargoAmounts: CL.VERY_LOW,
                shipyardNumShips: CL.VERY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                marketCargoAmounts: CL.VERY_HIGH,
                credits: CL.HIGH,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            credits: News.clHalfRegression(this.endEffects[0].credits),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            prestige: CL.SLIGHTLY_HIGH,
        })
        Object.assign(this.endEffects[1], {
            industry: CL.VERY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            shipyardNumShips: CL.SLIGHTLY_HIGH,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //need to have sufficient economy of our own
        const ratingsValid = planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS >= CL.SLIGHTLY_HIGH || planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE > CL.SLIGHTLY_HIGH
        //our economy should be larger than theirs
        const transferValid = planet.culture.economy > targetPlanet.culture.economy && planet.settlement.bank.baseCredits > targetPlanet.settlement.bank.baseCredits && planet.settlement.market.baseCargo.average > targetPlanet.settlement.market.baseCargo.average
        //both planets must be neutral or allies
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL || rel == RELATIONSHIP_TYPES.ALLY)
        //removed most of the requirements for this, can we not have like a marshall plan??
        const interferingEvent = 
            News.hasNews(NT.INVESTMENT, planet, targetPlanet)
        return transferValid && ratingsValid && relationshipsValid && !interferingEvent
    }
}
