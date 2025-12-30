class GenocideNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins purging its society of 'undesirable' elements! The other planets condemn this vile act!'`,
            `${coloredName(planet)}'s purge of its own people finally comes to an end!`,
            ``,
            ``,
            NT.GENOCIDE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                army: CL.LOW,
                navy: CL.LOW,
                economy: CL.LOW,
                education: CL.LOW,
                prestige: CL.LOW,
                crime: CL.LOW
            })
        ]
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.completeEffects[0], {
            population: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION,
            army: CL.NO_REGRESSION,
            navy: CL.NO_REGRESSION,
            economy: CL.NO_REGRESSION,
            education: CL.NO_REGRESSION,
            crime: CL.NO_REGRESSION,
            security: CL.VERY_HIGH,
        })
    }

    isValid() {
        const {planet: p} = this
        //more likely if security is very low (except in a police state)
        const ratingsValid = p.c.military > CL.MEDIUM && p.c.security < CL.VERY_LOW
        //planet must not already be in anarchy or puppet state
        const interferingEvent = News.planetHasAnyNews(planet, [NT.GENOCIDE])
        return (ratingsValid) && !interferingEvent
    }
}
