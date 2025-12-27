class ConscriptionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} institutes mandatory military conscription! Citizens are drafted en masse into the armed forces!`,
            `${coloredName(planet)}'s forced conscription program finally ends, but the economic damage lingers.`,
            NEWS_TYPES.CONSCRIPTION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                military: CL.VERY_HIGH,
                commerce: CL.LOW,
                industry: CL.LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Military gains are kept, but commerce/industry/prestige damage is permanent
        Object.assign(this.endEffects[0], {
            military: News.CL_NO_REGRESSION, // normalize back
            commerce: News.CL_NO_REGRESSION, // keep the damage
            industry: News.CL_NO_REGRESSION, // keep the damage
            prestige: CL.SLIGHTLY_LOW, // permanent prestige loss
        })
    }

    isValid() {
        const {planet} = this
        // More likely if military is low or security is low (militarizing society)
        const ratingsValid = planet.culture.military < 0.6 || planet.culture.security < 0.5
        // Police states and authoritarian regimes would do this; not democracies or anarchies
        const govCheck = planet.culture.governmentType != GOVERNMENT_TYPES.DEMOCRACY 
            && planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.CONSCRIPTION])
        return ratingsValid && govCheck && !interferingEvent
    }
}
