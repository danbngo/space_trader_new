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
                population: 1.4,
                commerce: 1.1,
                military: 0.9,
                security: 0.9,
                crime: 1.1,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //only the population boost lingers
        Object.assign(this.endEffects[0], {
            population: 1,
            guildNumOfficers: 1.3,
        })
    }

    isValid() {
        const {planet} = this
        //people generally go where theres economic opportunity and population not already bursting
        const ratingsValid = planet.culture.commerce >= 1 && planet.culture.population < 1.5
        const interferingEvent = 
            News.planetHasAnyNews(planet, NEWS_TYPES_ECONOMY_PREVENTING) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}