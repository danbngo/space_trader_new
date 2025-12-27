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
                marketPrices: CL.LOW,
                marketCargoAmounts: CL.VERY_HIGH,
                commerce: CL.HIGH,
                industry: CL.HIGH,
                credits: CL.VERY_HIGH,
                shipyardNumShips: CL.HIGH,
                prestige: CL.VERY_LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            commerce: News.clHalfRegression(this.endEffects[0].commerce),
            credits: News.clHalfRegression(this.endEffects[0].credits),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            shipyardNumShips: News.clHalfRegression(this.endEffects[0].shipyardNumShips),
            prestige: News.CL_NO_REGRESSION //not the best for your reputation
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
