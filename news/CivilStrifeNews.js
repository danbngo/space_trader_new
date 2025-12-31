class CivilStrifeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s people are rioting in the streets against their oppressive government!'`,
            `${coloredName(planet)}'s rioting is quelled as the government soothes the concerns of its citizens!`,
            `${coloredName(planet)} fails to stop the riots and is forced to suppress the population with force!`,
            '',
            NT.CIVIL_STRIFE, planet
        )

        this.addPlanetEffect(
            {
                security: CL.VERY_LOW,
                crime: CL.HIGH,
                prestige: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH]])),
            },
            {
                security: CL.HIGH,
            },
            {
                security: CL.LOW,
                crime: CL.SLIGHTLY_HIGH,
                prestige: CL.LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome(p.c.prestige*p.c.security*p.c.culture, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        //more likely if security is too high, prestige or culture are too low
        const ratingsValid = p.c.security > CL.HIGH || p.c.culture < CL.LOW || p.c.prestige < CL.LOW
        //planet must not already be in anarchy or puppet state
        const interferingEvent = News.planetHasAnyNews(p, NT_GOVERNANCE_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
