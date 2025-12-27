class ForcedLaborNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} implements brutal forced labor programs! Citizens are pressed into industrial work camps!`,
            `${coloredName(planet)}'s forced labor camps are finally dismantled!`,
            NEWS_TYPES.FORCED_LABOR, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.VERY_HIGH,
                commerce: CL.LOW,
                population: CL.LOW,
                prestige: CL.LOW,
                marketCargoAmounts: CL.VERY_HIGH,
                marketPrices: CL.LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Industrial gains are permanent, commerce damage and prestige loss are permanent
        Object.assign(this.endEffects[0], {
            industry: News.clHalfRegression(this.endEffects[0].industry),
            population: News.clHalfRegression(this.endEffects[0].population),
            commerce: News.CL_NO_REGRESSION, // keep the damage
            prestige: News.CL_NO_REGRESSION, // permanent prestige loss
        })
    }

    isValid() {
        const {planet} = this
        // More likely if industry is low (trying to industrialize)
        const ratingsValid = planet.culture.industry < 0.5
        // Authoritarian governments, police states, and communist states would do this
        // Not democracies or anarchies
        const govCheck = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.FORCED_LABOR])
        return ratingsValid && govCheck && !interferingEvent
    }
}
