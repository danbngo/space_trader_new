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
                culture: CL.VERY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.FOOD, CL.LOW], [CARGO_TYPES.WATER, CL.LOW], [CARGO_TYPES.MEDICINE, CL.LOW]])),
            },
            {
                population: CL.LOW,
                prestige: CL.LOW,
                education: CL.LOW,
                culture: CL.VERY_LOW,
                crime: CL.VERY_LOW,
                security: CL.VERY_HIGH,
            },
            {
                population: CL.SLIGHTLY_LOW,
                prestige: CL.VERY_LOW,
                education: CL.LOW,
                culture: CL.VERY_LOW,
                security: CL.LOW, //people are mad now
            }
        )
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.security*this.planet.c.army*this.planet.c.corruption/this.planet.c.culture/this.planet.c.prestige, CL.LOW)
    }

    shouldCancel() {
        const {planet: p} = this
        // Genocide cancelled if government undergoes major change
        return News.planetHasAnyNews(p, NT_GOVERNANCE_PREVENTING)
    }

    isValid() {
        const {planet: p} = this
        const ratingsValid = p.c.army > CL.MEDIUM && p.c.security < CL.VERY_LOW && p.c.corruption > CL.HIGH
        return (ratingsValid)
    }
}
