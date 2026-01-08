class ExplorationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} sends out a fleet of its best ships to survey and claim small bodies in the kuiper belt!`,
            `${coloredName(planet)}'s exploration mission succeeds, making important discoveries and claiming vast new territories!`,
            `${coloredName(planet)}'s exploration mission fails! Explorers lost in deep space!`,
            '',
            NT.EXPLORATION, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                reserves: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                navy: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH],
                    [CARGO_TYPES.ISOTOPES, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                taxes: CL.SLIGHTLY_HIGH,
                territory: CL.HIGH,
                prestige: CL.HIGH,
                education: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                navy: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH
            },
            {
                taxes: CL.SLIGHTLY_HIGH,
                navy: CL.LOW,
            }
        )
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.navy*this.planet.c.technology, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        const ratingsValid = p.c.navy > CL.MEDIUM && p.c.technology > CL.MEDIUM
        //basically don't do it if anything bad is happening
        const interferingEvent = News.planetHasAnyNewsTargeting(p, NT_ECONOMY_PREVENTING) || News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING) 
        return ratingsValid && !interferingEvent
    }
}
