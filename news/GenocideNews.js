class GenocideNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins horrifically purging its society of undesirable elements! The other planets condemn this vile act!'`,
            `${coloredName(planet)}'s purge of its people finally comes to an end!`,
            NEWS_TYPES.GENOCIDE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: 0.7,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            population: 1,
            security: 1.5,
            prestige: 0.9,
        })
    }

    isValid() {
        const {planet} = this
        //more likely if security is very low (except in a police state)
        const ratingsValid = planet.culture.security < 0.5
        const isPoliceState = planet.culture.governmentType == GOVERNMENT_TYPES.POLICE_STATE
        //cant be anarchy
        const govCheck = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY
        //planet must not already be in anarchy or puppet state
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.GENOCIDE])
        return (ratingsValid || isPoliceState) && govCheck && !interferingEvent
    }
}
