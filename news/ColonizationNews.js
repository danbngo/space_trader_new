class ColonizationNews extends News {
    constructor(planet = new Planet(), startYear = gs.year) {
        super(
            `${coloredName(planet)} sends colonists to small bodies throughout the system!`,
            `${coloredName(planet)}'s colonization exodus comes to an end!`,
            NEWS_TYPES.COLONIZATION, planet, null, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                populationModifiedBy: 0.8,
                commercialRatingModifiedBy: 1.1,
                territoryModifiedBy: 1.2,
                guildNumOfficersModifiedBy: 0.8,
                prestigeRatingModifiedBy: 1.1,
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            populationModifiedBy: 1,
            territoryModifiedBy: 1,
            prestigeRatingModifiedBy: 1,
        })
    }

    static isValid(planet = new Planet()) {
        const ratingsValid = planet.culture.population >= 1.0
        const interferingEvent = News.hasNews(planet, NEWS_TYPES.COLONIZATION) || News.hasNewsTargeting(planet, NEWS_TYPES.BOMBARDMENT)
        return ratingsValid && !interferingEvent
    }
}
