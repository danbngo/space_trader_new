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
                credits: 0.8,
                marketCargoAmounts: 0.6,
                shipyardNumShips: 0.6,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                credits: 1.2,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            credits: (1 + this.startEffects[0].credits)/2,
            marketCargoAmounts: (1 + this.startEffects[0].marketCargoAmounts)/2,
            prestige: 1.2,
        })
        Object.assign(this.endEffects[1], {
            credits: 1,
            industry: 1.5,
            commerce: 1.1,
            shipyardNumShips: 1.2,
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
