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
                industryModifiedBy: 0.8,
                creditsModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ISOTOPES, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //actual knowledge gained cannot be lost
        Object.assign(this.endEffects[0], {
            shipQualityModifiedBy: 1.3,
            prestigeModifiedBy: 1.1,
            officerQualityModifiedBy: 1.1,
            militaryModifiedBy: 1.1,
        })
    }

    isValid() {
        const {planet} = this
        //wont bother if we're already at the top
        const ratingsValid = planet.culture.shipQuality < 1.5
        //hard times dont block it, may actually accelerate technological progress
        const interferingEvent = News.hasNews(NEWS_TYPES.SCIENTIFIC_BREAKTHROUGH, planet)
        return ratingsValid && !interferingEvent
    }
}
