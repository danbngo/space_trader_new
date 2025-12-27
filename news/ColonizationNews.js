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
                guildNumOfficers: CL.LOW,
                marketPrices: CL.HIGH,
                shipyardNumShips: CL.VERY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, CL.VERY_HIGH], [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_HIGH]]),
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            population: News.CL_NO_REGRESSION, //pop doesnt auto recover
            guildNumOfficers: News.CL_NO_REGRESSION,
            shipyardNumShips: News.CL_NO_REGRESSION,
            commerce: CL.SLIGHTLY_HIGH,
            territory: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
        })
    }

    isValid() {
        const {planet} = this
        const ratingsValid = planet.culture.population > 1.5 || planet.settlement.shipyard.baseNumShips > 1.5 || planet.settlement.guild.baseNumOfficers > 1.5
        //basically dont do it if ANYTHING bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NEWS_TYPES.COLONIZATION, ...NEWS_TYPES_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
