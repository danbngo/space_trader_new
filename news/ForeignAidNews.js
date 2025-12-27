class ForeignAidNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s plight inspires other planets to send it foreign aid!`,
            `${coloredName(planet)}'s foreign aid finally dries up!`,
            NEWS_TYPES.FOREIGN_AID, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: 0.8,
                marketCargoAmounts: 1.4,
                commerce: 1.2,
                industry: 1.2,
                credits: 1.4,
                shipyardNumShips: 1.2,
                prestige: 0.6,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            marketCargoAmounts: (1 + this.endEffects[0].marketCargoAmounts)/2,
            commerce: (1 + this.endEffects[0].commerce)/2,
            credits: (1 + this.endEffects[0].credits)/2,
            industry: (1 + this.endEffects[0].industry)/2,
            shipyardNumShips: (1 + this.endEffects[0].shipyardNumShips)/2,
            prestige: 1 //not the best for your reputation
        })
    }

    isValid() {
        const {planet} = this
        //more likely to happen when economy is poor
        const ratingsValid = planet.culture.commerce < 0.75 && planet.culture.industry < 0.75 && planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS < 0.75
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.FOREIGN_AID, ...NEWS_TYPES_ECONOMY_BOOSTING]) || 
            News.planetHasAnyNews(planet, NEWS_TYPES_HOSTILE)
        return ratingsValid && !interferingEvent
    }
}
