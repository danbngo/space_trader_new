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
                military: CL.LOW, //get stretched thin
                prestige: CL.SLIGHTLY_HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                prestige: CL.SLIGHTLY_LOW,
                commerce: CL.VERY_LOW,
                marketPrices: CL.VERY_HIGH,
                marketCargoAmounts: CL.LOW,
                blackMarketPrices: CL.HIGH,
                blackMarketCargoAmounts: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, CL.VERY_HIGH], [CARGO_TYPES.METAL, CL.VERY_HIGH]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    isValid() {
        const {planet, targetPlanet} = this
        //need to have enough ships for it
        const ratingsValid = planet.culture.military > 1
        //cant be anarchic or puppet state
        const agencyValid = (planet.culture.governmentType !== GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType !== GOVERNMENT_TYPES.PUPPET_STATE)
        //planet must already be hostile to the target planet
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.HOSTILE
        const interferingEvent = 
            News.hasNews(NEWS_TYPES.EMBARGO, planet, targetPlanet) || 
            News.hasAnyNewsBidirectional(planet, targetPlanet, NEWS_TYPES_COOPERATIVE)
        return ratingsValid && agencyValid && relationshipValid && !interferingEvent
    }
}
