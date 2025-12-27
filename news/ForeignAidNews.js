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
                marketPricesModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 1.3,
                commerceModifiedBy: 1.2,
                industryModifiedBy: 1.1,
                creditsModifiedBy: 1.3,
                shipyardNumShipsModifiedBy: 1.2,
                prestigeModifiedBy: 0.6,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            marketCargoAmountsModifiedBy: (1 + this.endEffects[0].marketCargoAmountsModifiedBy)/2,
            commerceModifiedBy: (1 + this.endEffects[0].commerceModifiedBy)/2,
            creditsModifiedBy: (1 + this.endEffects[0].creditsModifiedBy)/2,
            industryModifiedBy: (1 + this.endEffects[0].industryModifiedBy)/2,
            shipyardNumShipsModifiedBy: (1 + this.endEffects[0].shipyardNumShipsModifiedBy)/2,
            prestigeModifiedBy: 1 //not the best for your reputation
        })
    }

    isValid() {
        const {planet} = this
        //more likely to happen when economy is poor
        const ratingsValid = planet.culture.commerce < 0.8 && planet.culture.industry < 0.8 && planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS < 0.8
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.FOREIGN_AID, ...NEWS_TYPES_ECONOMY_BOOSTING]) || 
            News.planetHasAnyNews(planet, NEWS_TYPES_HOSTILE)
        return ratingsValid && !interferingEvent
    }
}
