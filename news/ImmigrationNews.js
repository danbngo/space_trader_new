class ImmigrationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} experiences a massive influx of immigration!`,
            `The rush of immigration to ${coloredName(planet)} subsides.`,
            NEWS_TYPES.IMMIGRATION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                populationModifiedBy: 1.3,
                commercialRatingModifiedBy: 1.1,
                militaryRatingModifiedBy: 0.9,
                securityRatingModifiedBy: 0.9,
                crimeRatingModifiedBy: 1.1,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //only the population boost lingers
        Object.assign(this.endEffects[0], {
            populationModifiedBy: 1,
        })
    }

    isValid() {
        const {planet} = this
        //people generally go where theres economic opportunity
        const ratingsValid = planet.culture.commercialRating >= 1.2
        const interferingEvent = 
            News.planetHasAnyNews(planet, NEWS_TYPES_PROGRESS_PREVENTING) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_PROGRESS_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}