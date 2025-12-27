class ImmigrationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s wealth attracts a massive influx of immigration!`,
            `${coloredName(planet)}'s flood of immigration subsides.`,
            NEWS_TYPES.IMMIGRATION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                populationModifiedBy: 1.3,
                commerceModifiedBy: 1.1,
                militaryModifiedBy: 0.9,
                securityModifiedBy: 0.9,
                crimeModifiedBy: 1.1,
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
        const ratingsValid = planet.culture.commerce >= 1
        const interferingEvent = 
            News.planetHasAnyNews(planet, NEWS_TYPES_ECONOMY_PREVENTING) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}