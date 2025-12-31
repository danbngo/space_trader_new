class ScarcityNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s overconsumption has led to famine and scarcity!`,
            `${coloredName(planet)}'s great famine ends!`,
            `${coloredName(planet)}'s famine spirals into catastrophic collapse!`,
            ``,
            NT.SCARCITY, planet
        )

        this.addPlanetEffect(
            {
                planet: this.planet,
                population: CL.LOW,
                reserves: CL.EXTREMELY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WATER, CL.ASTRONOMICAL]]))
            },
            {
                population: CL.SLIGHTLY_LOW,
            },
            {
                population: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Scarcity ends unless economy/industry collapse further
        this.rollOutcome(1 - (1 - p.c.economy) * (1 - p.c.industry) * 0.3)
    }

    isValid() {
        const {planet: p} = this
        //more likely if high pop and high industry
        const ratingsValid = p.c.population > CL.HIGH || p.c.industry >= CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.SCARCITY, ...NT_ECONOMY_BOOSTING])
        return ratingsValid && !interferingEvent
    }
}
