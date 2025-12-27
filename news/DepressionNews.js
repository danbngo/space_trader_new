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
                marketPrices: 0.5,
                marketCargoAmounts: 0.4,
                commerce: 0.6,
                industry: 0.7,
                credits: 0.6,
                crime: 1.3,
                guildNumOfficers: 1.2,
                prestige: 0.8,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //some lingering price rate, cargo, commercial, and credit rate decreases
        Object.assign(this.endEffects[0], {
            credits: (1 + this.endEffects[0].credits)/2,
            marketCargoAmounts: (1 + this.endEffects[0].marketCargoAmounts)/2,
            commerce: (1 + this.endEffects[0].commerce)/2,
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
