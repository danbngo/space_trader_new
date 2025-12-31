class ScarcityNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s rampant overconsumption has led to famine and scarcity!`,
            `${coloredName(planet)}'s famine abates thanks to its stockpiles and supplies from trading partners!`,
            `${coloredName(planet)}'s famine sends the planet spiralling into social and economic free fall!`,
            ``,
            NT.SCARCITY, planet
        )

        this.addPlanetEffect(
            {
                population: CL.LOW,
                economy: CL.LOW,
                industry: CL.SLIGHTLY_LOW,
                wealth: CL.LOW,
                reserves: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.FOOD, CL.ASTRONOMICAL], [CARGO_TYPES.WATER, CL.ASTRONOMICAL]]))
            },
            {
                population: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW
            },
            {
                population: CL.VERY_LOW,
                economy: CL.VERY_LOW,
                industry: CL.LOW,
                wealth: CL.LOW,
                reserves: CL.EXTREMELY_LOW,
                culture: CL.LOW,
                security: CL.LOW,
                crime: CL.HIGH,
                corruption: CL.HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        //basically good planning and economic connection mitigate it
        this.rollOutcome((this.planet.c.economy + this.planet.c.prestige + this.planet.c.reserves)/3
            / this.planet.c.population / this.planet.c.industry, CL.SLIGHTLY_LOW)
    }

    isValid() {
        const {planet: p} = this
        //more likely if high pop and high industry
        const ratingsValid = p.c.population > CL.VERY_HIGH || p.c.industry >= CL.VERY_HIGH
        const interferingEvent = News.planetHasAnyNews(p, NT_ECONOMY_BOOSTING)
        return ratingsValid && !interferingEvent
    }
}
