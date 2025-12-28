class ColonizationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins building a fleet to colonize small bodies in the solar system!`,
            `${coloredName(planet)} has built settlements on small bodies throughout the system!`,
            NEWS_TYPES.COLONIZATION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                marketPrices: CL.HIGH,
                shipyardNumShips: CL.VERY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, CL.VERY_HIGH], [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_HIGH]]),
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            population: CL.NO_REGRESSION, //pop doesnt auto recover
            shipyardNumShips: CL.NO_REGRESSION,
            commerce: CL.SLIGHTLY_HIGH,
            territory: CL.VERY_HIGH,
            prestige: CL.SLIGHTLY_HIGH,
        })
    }

    isValid() {
        const {planet} = this
        const ratingsValid = planet.culture.population > CL.MEDIUM && (planet.settlement.shipyard.baseNumShips > CL.MEDIUM)
        //basically dont do it if ANYTHING bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NEWS_TYPES.COLONIZATION, ...NEWS_TYPES_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
