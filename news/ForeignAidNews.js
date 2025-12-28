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
                marketCargoAmounts: CL.HIGH,
                commerce: CL.HIGH,
                industry: CL.HIGH,
                credits: CL.HIGH,
                shipyardNumShips: CL.HIGH,
                prestige: CL.VERY_LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            marketPrices: News.clHalfRegression(this.endEffects[0].marketPrices),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            commerce: News.clHalfRegression(this.endEffects[0].commerce),
            credits: News.clHalfRegression(this.endEffects[0].credits),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            shipyardNumShips: News.clHalfRegression(this.endEffects[0].shipyardNumShips),
            prestige: CL.NO_REGRESSION //not the best for your reputation
        })
    }

    isValid() {
        const {planet} = this
        //more likely to happen when economy is poor and has some prestige to burn
        const economyValid = planet.culture.commerce < CL.LOW && planet.culture.industry < CL.LOW && planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS < CL.LOW
        const prestigeValid = planet.culture.prestige > CL.LOW
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.FOREIGN_AID, ...NEWS_TYPES_ECONOMY_BOOSTING]) || 
            News.planetHasAnyNews(planet, NEWS_TYPES_HOSTILE)
        return economyValid && prestigeValid && !interferingEvent
    }
}
