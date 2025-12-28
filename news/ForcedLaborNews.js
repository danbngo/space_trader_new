class ForcedLaborNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} implements brutal forced labor programs! Citizens are pressed into industrial work camps!`,
            `${coloredName(planet)}'s forced labor camps are finally dismantled!`,
            NT.FORCED_LABOR, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.VERY_HIGH,
                economy: CL.LOW,
                population: CL.LOW,
                prestige: CL.LOW,
                marketCargoAmounts: CL.HIGH,
                //marketPrices: CL.LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Industrial gains are permanent, economy damage and prestige loss are permanent
        Object.assign(this.endEffects[0], {
            industry: News.clHalfRegression(this.endEffects[0].industry),
            economy: News.clHalfRegression(this.endEffects[0].economy),
            population: News.clHalfRegression(this.endEffects[0].population),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            prestige: CL.NO_REGRESSION, // permanent prestige loss
        })
    }

    isValid() {
        const {planet} = this
        // More likely if industry is low (trying to industrialize)
        const ratingsValid = planet.culture.industry < CL.LOW
        // Authoritarian governments, police states, and communist states would do this
        // Not democracies or anarchies
        const govCheck = planet.culture.governmentType != GT.ANARCHY
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NT.FORCED_LABOR])
        return ratingsValid && govCheck && !interferingEvent
    }
}
