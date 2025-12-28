class GenocideNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins purging its society of 'undesirable' elements! The other planets condemn this vile act!'`,
            `${coloredName(planet)}'s purge of its own people finally comes to an end!`,
            NEWS_TYPES.GENOCIDE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                military: CL.LOW,
                commerce: CL.LOW,
                officerQuality: CL.LOW,
                prestige: CL.EXTREMELY_LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            population: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION,
            military: CL.NO_REGRESSION,
            commerce: CL.NO_REGRESSION,
            officerQuality: CL.NO_REGRESSION,
            security: CL.EXTREMELY_HIGH,
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
