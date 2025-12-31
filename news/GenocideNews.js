class GenocideNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins purging its society of 'undesirable' elements! The other planets condemn this vile act!'`,
            `${coloredName(planet)}'s purge of its own people comes to a grisly end as millions are placed in camps!`,
            `${coloredName(planet)}'s purge is cut short amid an uproar from the interplanetary community!`,
            ``,
            NT.GENOCIDE, planet
        )

        this.addPlanetEffect(
            {
                population: CL.LOW,
                prestige: CL.LOW,
                education: CL.LOW,
                culture: CL.VERY_LOW
            },
            {
                population: CL.LOW,
                prestige: CL.LOW,
                crime: CL.VERY_LOW,
                security: CL.VERY_HIGH,
                culture: CL.VERY_LOW
            },
            {
                population: CL.SLIGHTLY_LOW,
                prestige: CL.VERY_LOW,
                security: CL.LOW, //people are mad now
                culture: CL.VERY_LOW
            }
        )
    }

    determineOutcome() {
        // Genocide always completes, never fails
    }

    isValid() {
        const {planet: p} = this
        //more likely if security is very low (except in a police state)
        const ratingsValid = p.c.army > CL.MEDIUM && p.c.security < CL.VERY_LOW
        //planet must not already be in anarchy or puppet state
        return (ratingsValid)
    }
}
