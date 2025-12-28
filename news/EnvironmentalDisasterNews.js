class EnvironmentalDisasterNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s polluting has led to environmental disaster! Cleanup efforts are underway!`,
            `${coloredName(planet)} has cleaned up their environmental disaster, but lasting damage to the planet remains!`,
            NEWS_TYPES.ENVIRONMENTAL_DISASTER, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: CL.SLIGHTLY_HIGH,
                marketCargoAmounts: CL.LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.VERY_LOW,
                population: CL.SLIGHTLY_LOW,
                credits: CL.LOW,
                shipyardNumShips: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, CL.VERY_HIGH], [CARGO_TYPES.MEDICINE, CL.VERY_HIGH]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //market, economy, industry, population do not fully bounce back
        Object.assign(this.endEffects[0], {
            marketPrices: News.clHalfRegression(this.endEffects[0].marketPrices),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            population: News.clHalfRegression(this.endEffects[0].population),
        })
    }

    isValid() {
        const {planet} = this
        //happens when industry is getting out of hand
        const ratingsValid = planet.culture.industry >= CL.HIGH
        const interferingEvent = News.hasNews(NEWS_TYPES.ENVIRONMENTAL_DISASTER, planet)
        return ratingsValid && !interferingEvent
    }
}
