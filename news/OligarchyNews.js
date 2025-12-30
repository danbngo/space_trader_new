class OligarchyNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s economy is seized by powerful oligarchs who carve out private fiefdoms!`,
            `${coloredName(planet)}'s oligarchs lose their grip on power as the masses rise up!`,
            `${coloredName(planet)}'s oligarchs consolidate permanent control over the economy!`,
            ``,
            NT.OLIGARCHY, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                security: CL.LOW,
                wealth: CL.LOW,
            })
        ]
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Commerce and prestige damage are permanent (oligarchs still control economy)
        Object.assign(this.completeEffects[0], {
            //prestige: News.clHalfRegression(this.completeEffects[0].prestige),
            economy: News.clHalfRegression(this.completeEffects[0].economy),
        })

        // Failed: oligarchs entrench permanently
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.NO_REGRESSION, // permanent economic damage
                prestige: CL.NO_REGRESSION,
                security: CL.NO_REGRESSION,
                wealth: CL.NO_REGRESSION,
                crime: CL.HIGH, // corruption entrenched
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Oligarchy becomes permanent if security too weak to resist
        const failProbability = (1 - planet.civilization.security) * 0.4
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet: p} = this
        // More likely if economy is high 
        const ratingsValid = (planet.civilization.economy > CL.HIGH)
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NT.OLIGARCHY])
        return ratingsValid && !interferingEvent
    }
}
