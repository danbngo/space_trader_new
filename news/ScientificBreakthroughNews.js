class ScientificBreakthroughNews extends News {
    constructor(planet = new Planet(), startYear = gs.year) {
        super(
            `${coloredName(planet)} makes a series of scientific breakthroughs!`,
            `The rapid scientific progress on ${coloredName(planet)} comes to an end.`,
            NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH, planet, null, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                commercialRatingModifiedBy: 1.1,
                industrialRatingModifiedBy: 1.2,
                shipQualityModifiedBy: 1.2,
                prestigeRatingModifiedBy: 1.1,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //actual knowledge gained cannot be lost
        Object.assign(this.endEffects[0], {
            shipQualityModifiedBy: 1.0,
            commercialRatingModifiedBy: (1 + this.endEffects[0].commercialRatingModifiedBy)/2,
            industrialRatingModifiedBy: (1 + this.endEffects[0].industrialRatingModifiedBy)/2,
            prestigeRatingModifiedBy: (1 + this.endEffects[0].prestigeRatingModifiedBy)/2,
        })
    }

    isValid(planet = new Planet()) {
        //generally need a functioning government and economy for this
        const stabilityValid = planet.culture.militaryRating > 1 && planet.culture.commercialRating > 1
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH)
        return stabilityValid && !interferingEvent
    }
}
