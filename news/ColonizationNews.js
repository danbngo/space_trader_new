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
                population: 0.8,
                guildNumOfficers: 0.8,
                marketPrices: 1.2,
                shipyardNumShips: 0.6,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, 1.5], [CARGO_TYPES.ISOTOPES, 2]]),
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            population: 1, //pop doesnt auto recover
            guildNumOfficers: 1,
            shipyardNumShips: 1,
            commerce: 1.1,
            territory: 1.2,
            prestige: 1.1,
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
