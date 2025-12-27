class SurplusNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s miners have hit the motherlode! A surplus of goods floods the market!`,
            `${coloredName(planet)}'s resource-rich economy returns to normal.`,
            NEWS_TYPES.SURPLUS, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: 0.8,
                marketCargoAmounts: 1.5,
                commerce: 1.2,
                industry: 1.4,
                credits: 1.3,
                shipyardNumShips: 1.4,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //goods remain high After
        Object.assign(this.endEffects[0], {
            industry: (1 + this.endEffects[0].industry)/2,
            commerceModiifiedBy: (1 + this.endEffects[0].commerce)/2,
            marketCargoAmounts: (1 + this.endEffects[0].marketCargoAmounts)/2,
        })
    }

    isValid() {
        const {planet} = this
        //we needed to be resource scarce to be looking for them so hard
        const ratingsValid = planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE < 0.75
        //more for flavor than anything, irl you could find goodies at any time
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.SURPLUS, NEWS_TYPES.DEPRESSION, NEWS_TYPES.SCARCITY])
        return ratingsValid && !interferingEvent
    }
}
