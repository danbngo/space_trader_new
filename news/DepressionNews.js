class DepressionNews extends News {
    constructor(planet = new Planet(), startYear = gs.year) {
        super(
            `${coloredName(planet)} enters a Depression!`,
            `${coloredName(planet)} recovers from its Depression!`,
            NEWS_TYPES.DEPRESSION, planet, null, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPricesModifiedBy: 0.7,
                marketCargoAmountsModifiedBy: 0.6,
                commercialRatingModifiedBy: 0.6,
                industrialRatingModifiedBy: 0.7,
                bankCreditsModifiedBy: 0.6,
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

    static isValid(planet = new Planet()) {
        //more likely to happen when industry outpaces commerce
        const ratingsValid = planet.culture.industrialRating > planet.culture.commercialRating

        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.DEPRESSION) || News.hasNews(planet, NEWS_TYPES.ECONOMIC_BOOM) ||
            News.hasNews(planet, NEWS_TYPES.CONSTRUCTION) || News.hasNews(planet, NEWS_TYPES.WAR) ||
            News.hasNews(planet, NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH)
        return ratingsValid && !interferingEvent
    }
}
