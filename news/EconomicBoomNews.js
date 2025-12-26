class EconomicBoomNews extends News {
    constructor(planet = new Planet(), startYear = gs.year) {
        super(
            `${coloredName(planet)} experiences an economic boom!`,
            `${coloredName(planet)}'s booming economy normalizes.`,
            NEWS_TYPES.ECONOMIC_BOOM, planet, null, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPricesModifiedBy: 1.1,
                marketCargoAmountsModifiedBy: 1.5,
                commercialRatingModifiedBy: 1.4,
                industrialRatingModifiedBy: 1.3,
                populationModifiedBy: 1.1,
                bankCreditsModifiedBy: 1.5,
                shipyardNumShipsModifiedBy: 1.4,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    static isValid(planet = new Planet()) {
        //happens when economy is already somewhat good
        const ratingsValid = planet.culture.commercialRating >= 1.0 && planet.culture.industrialRating >= 1.0

        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.DEPRESSION) || News.hasNews(planet, NEWS_TYPES.ECONOMIC_BOOM) ||
            News.hasNews(planet, NEWS_TYPES.SCARCITY) || News.hasNews(planet, NEWS_TYPES.INFLATION) ||
            News.hasNewsTargeting(planet, NEWS_TYPES.WAR) || News.hasNewsTargeting(planet, NEWS_TYPES.BOMBARDMENT)
        return ratingsValid && !interferingEvent
    }
}
