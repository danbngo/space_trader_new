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
                military: CL.LOW,
                territory: CL.HIGH,
                commerce: CL.LOW,
                prestige: CL.VERY_LOW, //people dont like power players
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //some lingering drops, especially prestige
        Object.assign(this.endEffects[0], {
            territory: News.CL_NO_REGRESSION,
            prestige: News.CL_NO_REGRESSION,
            military: News.clHalfRegression(this.endEffects[0].military),
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
