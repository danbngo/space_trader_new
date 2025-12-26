class EmbargoNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Embargo imposed by ${coloredName(planet)} on ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)} lifts embargo on ${coloredName(targetPlanet)}!`,
            NEWS_TYPES.EMBARGO, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                militaryRatingModifiedBy: 0.8, //get stretched thin
                prestigeRatingModifiedBy: 1.1,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                prestigeRatingModifiedBy: 0.9,
                commercialRatingModifiedBy: 0.6,
                marketPricesModifiedBy: 1.4,
                marketCargoAmountsModifiedBy: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 1.5], [CARGO_TYPES.METAL, 1.5]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    isValid() {
        const {planet, targetPlanet} = this
        //need to have enough ships for it
        const ratingsValid = planet.culture.militaryRating > 1
        //cant be anarchic or puppet state
        const agencyValid = (planet.culture.governmentType !== GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType !== GOVERNMENT_TYPES.PUPPET_STATE)
        //planet must already be hostile to the target planet
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.HOSTILE
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.EMBARGO, targetPlanet) || 
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet)
        return ratingsValid && agencyValid && relationshipValid && !interferingEvent
    }
}
