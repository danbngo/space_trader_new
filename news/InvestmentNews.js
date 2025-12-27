class InvestmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends a massive investment to ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s investment in ${coloredName(targetPlanet)} is complete!`,
            NEWS_TYPES.INVESTMENT, planet, targetPlanet
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
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            credits: News.clHalfRegression(this.startEffects[0].credits),
            marketCargoAmounts: News.clHalfRegression(this.startEffects[0].marketCargoAmounts),
            prestige: CL.HIGH,
        })
        Object.assign(this.endEffects[1], {
            industry: CL.VERY_HIGH,
            commerce: CL.SLIGHTLY_HIGH,
            shipyardNumShips: CL.HIGH,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //need to have sufficient economy of our own
        const ratingsValid = planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS >= 1.25 || planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE > 1.25
        //our economy should be larger than theirs
        const transferValid = planet.culture.commerce > targetPlanet.culture.commerce && planet.settlement.bank.baseCredits > targetPlanet.settlement.bank.baseCredits && planet.settlement.market.baseCargo.average > targetPlanet.settlement.market.baseCargo.average
        //both planets must be neutral or allies
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL || rel == RELATIONSHIP_TYPES.ALLY)
        //removed most of the requirements for this, can we not have like a marshall plan??
        const interferingEvent = 
            News.hasNews(NEWS_TYPES.INVESTMENT, planet, targetPlanet)
        return transferValid && ratingsValid && relationshipsValid && !interferingEvent
    }
}
