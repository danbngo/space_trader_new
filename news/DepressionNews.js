class DepressionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} enters a Depression!`,
            `${coloredName(planet)} recovers from its Depression!`,
            NEWS_TYPES.DEPRESSION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPricesModifiedBy: 0.5,
                marketCargoAmountsModifiedBy: 0.4,
                commerceModifiedBy: 0.6,
                industryModifiedBy: 0.7,
                creditsModifiedBy: 0.2,
                crimeModifiedBy: 1.3,
                guildNumOfficersModifiedBy: 1.2,
                prestigeModifiedBy: 0.8,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //some lingering price rate, cargo, commercial, and credit rate decreases
        Object.assign(this.endEffects[0], {
            creditsModifiedBy: (1 + this.endEffects[0].creditsModifiedBy)/2,
            marketCargoAmountsModifiedBy: (1 + this.endEffects[0].marketCargoAmountsModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //more likely to happen when credit is REALLY high
        const ratingsValid = (planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS) > 1.5
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.DEPRESSION, ...NEWS_TYPES_ECONOMY_BOOSTING]) || 
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_BOOSTING)
        return ratingsValid && !interferingEvent
    }
}
