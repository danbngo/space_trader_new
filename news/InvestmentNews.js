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
                marketCargoAmountsModifiedBy: 0.8,
                commerceModifiedBy: 0.8,
                creditsModifiedBy: 0.6,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                creditsModifiedBy: 1.2,
            })

        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.startEffects[0], {
            commerceModifiedBy: (1 + this.startEffects[0].commerceModifiedBy)/2,
            creditsModifiedBy: (1 + this.startEffects[0].creditsModifiedBy)/2,
            marketCargoAmountsModifiedBy: (1 + this.startEffects[0].marketCargoAmountsModifiedBy)/2,
            prestigeModifiedBy: 1.1,
        })
        Object.assign(this.endEffects[1], {
            industryModifiedBy: 1.5,
            prestigeModifiedBy: 0.9, //the hidden cost, debt = control
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //need to have sufficient economy of our own
        const ratingsValid = planet.culture.commerce >= 1.2 && planet.settlement.bank.baseCredits >= BANK_AVERAGE_CREDITS*1.2 && planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE >= 1.2
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
