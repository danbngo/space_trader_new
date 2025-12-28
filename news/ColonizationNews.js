class ColonizationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins building a fleet to colonize resource-rich asteroids in the central belt!`,
            `${coloredName(planet)}'s colony ships have finished building settlements on resource laden asteroids!`,
            NT.COLONIZATION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                marketPrices: CL.HIGH,
                shipyardNumShips: CL.VERY_LOW,
                shipQuality: CL.LOW,
                marketCargoAmounts: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, CL.VERY_HIGH], [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_HIGH]]),
                credits: CL.LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            population: CL.NO_REGRESSION, //pop doesnt auto recover
            shipyardNumShips: CL.NO_REGRESSION,
            shipQuality: CL.NO_REGRESSION,
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            economy: CL.HIGH,
            industry: CL.HIGH,
            territory: CL.HIGH,
        })
    }

    isValid() {
        const {planet} = this
        const ratingsValid = planet.culture.population > CL.MEDIUM && (planet.settlement.shipyard.baseNumShips > CL.MEDIUM)
        //basically dont do it if ANYTHING bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NT.COLONIZATION, ...NT_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
