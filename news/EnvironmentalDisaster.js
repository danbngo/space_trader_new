class EnvironmentalDisasterNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s polluting has led to environmental disaster!`,
            `${coloredName(planet)} has successfully mitigated their environmental disaster!`,
            NEWS_TYPES.ENVIRONMENTAL_DISASTER, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: 1.1,
                marketCargoAmounts: 0.8,
                commerce: 0.8,
                industry: 0.4,
                population: 0.9,
                credits: 0.8,
                shipyardNumShips: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 1.5], [CARGO_TYPES.MEDICINE, 1.5]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //market, commerce, industry, population do not fully bounce back
        Object.assign(this.endEffects[0], {
            marketPrices: (1 + this.endEffects[0].marketPrices)/2,
            commerce: (1 + this.endEffects[0].commerce)/2,
            industry: (1 + this.endEffects[0].industry)/2,
            population: (1 + this.endEffects[0].population)/2,
        })
    }

    isValid() {
        const {planet} = this
        //happens when industry is getting out of hand
        const ratingsValid = planet.culture.industry >= 1.5
        const interferingEvent = News.hasNews(NEWS_TYPES.ENVIRONMENTAL_DISASTER, planet)
        return ratingsValid && !interferingEvent
    }
}
