class ForcedLaborNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} implements brutal forced labor programs! Citizens are pressed into industrial work camps!`,
            `${coloredName(planet)}'s forced labor camps are dismantled, but the industrial infrastructure remains.`,
            NEWS_TYPES.FORCED_LABOR, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: 1.6,
                commerce: 0.75,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Industrial gains are permanent, commerce damage and prestige loss are permanent
        Object.assign(this.endEffects[0], {
            industry: 1, // keep the gains
            commerce: 1, // keep the damage
            prestige: 0.85, // permanent prestige loss
        })
    }

    isValid() {
        const {planet} = this
        // More likely if industry is low (trying to industrialize)
        const ratingsValid = planet.culture.industry < 0.6
        // Authoritarian governments, police states, and communist states would do this
        // Not democracies or anarchies
        const govCheck = planet.culture.governmentType == GOVERNMENT_TYPES.AUTHORITARIAN
            || planet.culture.governmentType == GOVERNMENT_TYPES.POLICE_STATE
            || planet.culture.governmentType == GOVERNMENT_TYPES.COMMUNIST
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.FORCED_LABOR])
        return ratingsValid && govCheck && !interferingEvent
    }
}
