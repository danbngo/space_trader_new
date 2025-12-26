class InflationNews extends News {
    constructor(planet = new Planet(), startYear = gs.year) {
        super(
            `Inflation spirals out of control on ${coloredName(planet)}!`,
            `Inflation finally subsides on ${coloredName(planet)}!`,
            NEWS_TYPES.INFLATION, planet, null, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                commercialRatingModifiedBy: 0.7,
                marketPricesModifiedBy: 1.4,
                marketCargoAmountsModifiedBy: 0.8,
                bankCreditsModifiedBy: 0.7,
                crimeRatingModifiedBy: 1.2,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering price increases
        Object.assign(this.endEffects[0], {
            marketPricesModifiedBy: (1 + this.endEffects[0].marketPricesModifiedBy)/2,
        })
    }

    static isValid(planet = new Planet()) {
        //not likely when commercial activity is low
        const ratingsValid = planet.culture.commercialRating >= 1.0
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.INFLATION) //same time as economic boom is possible!
        return ratingsValid && !interferingEvent
    }
}
