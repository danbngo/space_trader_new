class SystemAtWarNews extends News {
    constructor() {
        super(
            `${gs.system.name} ERUPTS INTO TOTAL WAR!`,
            `${gs.system.name} GREAT WAR ENDS!`,
            NEWS_TYPES.SYSTEM_AT_WAR
        )

        this.startEffects = [
            new NewsEffect({}),
            new NewsEffect({})
        ]

        //dont automatically recover. lets add recovery events elsewhere
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[1], {
            populationModifiedBy: 1.0,
            militaryRatingModifiedBy: 1.0,
            industrialRatingModifiedBy: 1.0,
            commercialRatingModifiedBy: 1.0,
            securityRatingModifiedBy: 1.0,
            marketCargoAmountsModifiedBy: 1.0,
            //marketPricesModifiedBy: 1.0, //prices will normalize
            shipQualityModifiedBy: 1.0,
            officerQualityModifiedBy: 1.0,
            buildingsEnabled: [],
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planet must not already be at war with the target planet
        const ratingsValid = planet.culture.militaryRating > 1 //need to actually have enough ships to hurt them
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = 
            News.hasNews(META_NEWS_TYPES.SYSTEM_AT_WAR, planet) || 
            News.hasNews(NEWS_TYPES.ALLIANCE, planet, targetPlanet) || News.hasNews(NEWS_TYPES.ALLIANCE, targetPlanet, planet) ||
            News.hasNews(NEWS_TYPES.TRADE_AGREEMENT, planet, targetPlanet) || News.hasNews(NEWS_TYPES.TRADE_AGREEMENT, targetPlanet, planet) ||
            News.hasNews(NEWS_TYPES.RESEARCH_AGREEMENT, planet, targetPlanet) || News.hasNews(NEWS_TYPES.RESEARCH_AGREEMENT, targetPlanet, planet)
        return ratingsValid && relationshipValid && !interferingEvent
    }
}
