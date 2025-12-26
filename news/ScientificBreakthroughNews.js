class ScientificBreakthroughNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins work on a major scientific project!`,
            `${coloredName(planet)} completes their scientific project, unlocking a major new technology!`,
            NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industrialRatingModifiedBy: 0.8,
                creditsModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ISOTOPES, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //actual knowledge gained cannot be lost
        Object.assign(this.endEffects[0], {
            shipQualityModifiedBy: 1.2,
            prestigeRatingModifiedBy: 1.1,
            officerQualityModifiedBy: 1.1,
            militaryRatingModifiedBy: 1.1,
        })
    }

    isValid() {
        const {planet} = this
        //generally need a functioning government and economy for this
        const stabilityValid = planet.culture.industryRating > 1 && planet.culture.commercialRating > 1
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH)
        return stabilityValid && !interferingEvent
    }
}
