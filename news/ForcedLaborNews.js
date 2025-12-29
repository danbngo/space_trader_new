class ForcedLaborNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} implements brutal forced labor programs! Citizens are pressed into industrial work camps!`,
            `${coloredName(planet)}'s forced labor camps are finally dismantled!`,
            `Slave revolts force ${coloredName(planet)} to shut down labor camps!`,
            ``,
            NT.FORCED_LABOR, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.VERY_HIGH,
                economy: CL.SLIGHTLY_LOW,
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
            population: News.clHalfRegression(this.endEffects[0].population),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            prestige: CL.NO_REGRESSION, // permanent prestige loss
        })

        // Failed: revolts shut down camps, no industrial gain
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.VERY_LOW, // mass casualties in revolts
                economy: CL.LOW, // disruption
                prestige: CL.VERY_LOW, // humanitarian crisis
                crime: CL.VERY_HIGH, // lawlessness from revolts
                military: CL.LOW, // military stretched dealing with revolts
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Forced labor fails if security too low (revolts succeed)
        const revoltProbability = (1 - planet.culture.security) * 0.4
        this.failed = Math.random() < revoltProbability
    }

    isValid() {
        const {planet} = this
        // More likely if industry is low (trying to industrialize)
        const ratingsValid = planet.culture.industry < CL.LOW
        // Authoritarian governments, police states, and communist states would do this
        const interferingEvent = News.planetHasAnyNews(planet, [NT.FORCED_LABOR])
        return ratingsValid && !interferingEvent
    }
}
