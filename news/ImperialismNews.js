class ImperialismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} enacts blatant land grabs, expanding their territory!`,
            `${coloredName(planet)}'s imperialist expansion finally grinds to a halt!`,
            NEWS_TYPES.IMPERIALISM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                militaryModifiedBy: 0.8,
                territoryModifiedBy: 1.3,
                commerceModifiedBy: 0.8,
                prestigeModifiedBy: 0.6, //people dont like power players
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //some lingering drops, especially prestige
        Object.assign(this.endEffects[0], {
            territoryModifiedBy: 1,
            prestigeModifiedBy: 1,
            militaryModifiedBy: (1 + this.endEffects[0].militaryModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //more likely to happen when prestige is high and territory meh
        const ratingsValid = planet.culture.prestige > 1.5 && planet.culture.territory < 1
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.IMPERIALISM, ...NEWS_TYPES_CRIME_PREVENTING]) || 
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_HOSTILE)
        return ratingsValid && !interferingEvent
    }
}
