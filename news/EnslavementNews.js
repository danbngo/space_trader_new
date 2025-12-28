class EnslavementNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins enslaving populations from minor moons and settlements! Forced labor crews arrive in chains!`,
            `${coloredName(planet)} officially ends its slavery programs.`,
            NEWS_TYPES.ENSLAVEMENT, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                commerce: CL.HIGH,
                industry: CL.HIGH,
                population: CL.VERY_HIGH,
                security: CL.VERY_LOW,
                prestige: CL.LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Commerce and population gains are permanent, prestige loss is permanent
        Object.assign(this.endEffects[0], {
            commerce: News.clHalfRegression(this.endEffects[0].commerce),
            population: News.clHalfRegression(this.endEffects[0].population),
            security: News.clHalfRegression(this.endEffects[0].security),
            prestige: News.clHalfRegression(this.endEffects[0].prestige),
        })
    }

    isValid() {
        const {planet} = this
        // More likely if commerce/industry AND population is low (seeking economic boost)
        const ratingsValid = (planet.culture.commerce < 0.75 || planet.culture.industry < 0.75) && planet.culture.population < 0.75
        // Only authoritarian, police states, or corporate states would enslave
        // Not democracies, republics, or anarchies
        const govCheck = planet.culture.governmentType == GOVERNMENT_TYPES.AUTHORITARIAN
            || planet.culture.governmentType == GOVERNMENT_TYPES.POLICE_STATE
            || planet.culture.governmentType == GOVERNMENT_TYPES.CORPORATE_STATE
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.ENSLAVEMENT])
        return ratingsValid && govCheck && !interferingEvent
    }
}
