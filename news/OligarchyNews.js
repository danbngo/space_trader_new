class OligarchyNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s economy is seized by powerful oligarchs who carve out private fiefdoms!`,
            `${coloredName(planet)}'s oligarchs lose their grip on power as the masses rise up!`,
            NT.OLIGARCHY, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                security: CL.LOW,
                credits: CL.LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Commerce and prestige damage are permanent (oligarchs still control economy)
        Object.assign(this.endEffects[0], {
            //prestige: News.clHalfRegression(this.endEffects[0].prestige),
            economy: News.clHalfRegression(this.endEffects[0].economy),
        })
    }

    isValid() {
        const {planet} = this
        // More likely if economy is high 
        const ratingsValid = (planet.culture.economy > CL.HIGH)
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NT.OLIGARCHY])
        return ratingsValid && !interferingEvent
    }
}
