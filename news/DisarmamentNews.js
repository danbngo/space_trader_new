class DisarmamentNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} seeks peace and begins a period of disarmament!`,
            `${coloredName(planet)}'s disarmament period comes to an end!`,
            NEWS_TYPES.DISARMAMENT, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                militaryRatingModifiedBy: 0.8,
                territoryModifiedBy: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, 0.5]]),
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            militaryRatingModifiedBy: 1, 
            territoryModifiedBy: 1,
            industrialRatingModifiedBy: 1.1,
            prestigeRatingModifiedBy: 1.1,
        })
    }

    isValid() {
        const {planet} = this
        //unlikely if planet has a low military already
        const ratingsValid = planet.culture.militaryRating >= 1.0
        const interferingEvent = News.hasNews(planet, NEWS_TYPES.WAR) || News.hasNewsTargeting(planet, NEWS_TYPES.WAR) || 
            News.hasNews(planet, NEWS_TYPES.DISARMAMENT) || News.hasNews(planet, NEWS_TYPES.MILITARY_BUILDUP) ||
            News.hasNews(planet, NEWS_TYPES.BOMBARDMENT) || News.hasNewsTargeting(planet, NEWS_TYPES.BOMBARDMENT) ||
            News.hasNews(planet, NEWS_TYPES.EMBARGO) || News.hasNewsTargeting(planet, NEWS_TYPES.EMBARGO)

        return ratingsValid && !interferingEvent
    }
}
