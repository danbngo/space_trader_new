class CrackdownNews extends News {
    constructor(planet = new Planet(), startYear = gs.year) {
        super(
            `Government cracks down on crime on ${coloredName(planet)}!`,
            `The anti-crime crackdown on ${coloredName(planet)} ends.`,
            NEWS_TYPES.CRACKDOWN, planet, null, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                securityRatingModifiedBy: 1.4,
                crimeRatingModifiedBy: 0.7,
                militaryRatingModifiedBy: 1.1,
                blackMarketCargoAmountsModifiedBy: 0.6,
                blackMarketPricesModifiedBy: 1.3,
                prestigeRatingModifiedBy: 0.8, //other planets look unfavorably on this
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering crime decrease
        Object.assign(this.endEffects[0], {
            crimeRatingModifiedBy: (1 + this.endEffects[0].crimeRatingModifiedBy)/2,
            blackMarketPricesModifiedBy: (1 + this.endEffects[0].blackMarketPricesModifiedBy)/2,
            blackMarketCargoAmountsModifiedBy: (1 + this.endEffects[0].blackMarketCargoAmountsModifiedBy)/2,
        })
    }

    static isValid(planet = new Planet()) {
        //wont happen if crime is already low
        const crimeValid = planet.culture.crimeRating > 1

        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.CRACKDOWN)
        return crimeValid && !interferingEvent
    }
}
