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
                marketCargoAmountsModifiedBy: 0.6,
                commercialRatingModifiedBy: 0.6,
                industrialRatingModifiedBy: 0.7,
                creditsModifiedBy: 0.2,
                crimeRatingModifiedBy: 1.3,
                guildNumOfficersModifiedBy: 1.2,
                prestigeRatingModifiedBy: 0.8,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //some lingering price rate decreases
        Object.assign(this.endEffects[0], {
            marketPricesModifiedBy: (1 + this.endEffects[0].marketPricesModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //more likely to happen when credit is REALLY high
        const ratingsValid = planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS > 1.5
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.DEPRESSION) || News.hasNews(planet, NEWS_TYPES.ECONOMIC_BOOM) ||
            News.hasNews(planet, NEWS_TYPES.CONSTRUCTION) || News.hasNews(planet, NEWS_TYPES.WAR) ||
            News.hasNews(planet, NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH) || News.hasNews(planet, NEWS_TYPES.SURPLUS)
        return ratingsValid && !interferingEvent
    }
}
