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
                populationModifiedBy: 0.7,
                guildNumOfficersModifiedBy: 1.4,
                marketPricesModifiedBy: 1.2,
                shipyardNumShipsModifiedBy: 1.4,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, 1.5], [CARGO_TYPES.ISOTOPES, 2]]),
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            populationModifiedBy: 1, //pop doesnt auto recover
            commerceModifiedBy: 1.1,
            territoryModifiedBy: 1.2,
            prestigeModifiedBy: 1.1,
        })
    }

    isValid() {
        const {planet} = this
        const ratingsValid = planet.culture.population > 1.5
        //basically dont do it if ANYTHING bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NEWS_TYPES.COLONIZATION, ...NEWS_TYPES_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
