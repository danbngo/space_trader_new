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
                populationModifiedBy: 0.8,
                guildNumOfficersModifiedBy: 0.8,
                marketPricesModifiedBy: 1.2,
                shipyardNumShipsModifiedBy: 1.4,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, 1.5], [CARGO_TYPES.ISOTOPES, 2]]),
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            population: 1, //pop doesnt auto recover
            commercialRatingModifiedBy: 1.1,
            territoryModifiedBy: 1.2,
            prestigeRatingModifiedBy: 1.1,
        })
    }

    isValid() {
        const {planet} = this
        const ratingsValid = planet.culture.population >= 1.0
        //basically dont do it if ANYTHING bad is happening
        const interferingEvent = News.hasNews(planet, NEWS_TYPES.COLONIZATION) || News.hasNewsTargeting(planet, NEWS_TYPES.BOMBARDMENT) || News.hasNews(planet, NEWS_TYPES.PLAGUE) || 
            News.hasNews(planet, NEWS_TYPES.DEPRESSION) || News.hasNews(planet, NEWS_TYPES.SCARCITY) || News.hasNews(planet, NEWS_TYPES.REVOLUTION) || News.hasNews(planet, NEWS_TYPES.CIVIL_WAR) ||
            News.hasNews(planet, NEWS_TYPES.WAR) || News.hasNewsTargeting(planet, NEWS_TYPES.WAR) || News.hasNews(planet, NEWS_TYPES.BOMBARDMENT)
        return ratingsValid && !interferingEvent
    }
}
