class EnslavementNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins enslaving populations from minor moons and settlements! Forced labor crews arrive in chains!`,
            `${coloredName(planet)} officially ends its slavery programs, but the workforce remains expanded.`,
            NEWS_TYPES.ENSLAVEMENT, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                commerce: 1.4,
                population: 1.3,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Commerce and population gains are permanent, prestige loss is permanent
        Object.assign(this.endEffects[0], {
            commerce: 1, // keep the gains
            population: 1, // keep the gains
            prestige: 0.8, // permanent prestige hit
        })
    }

    isValid() {
        const {planet} = this
        // More likely if commerce is low (seeking economic boost)
        const ratingsValid = planet.culture.commerce < 0.6
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
