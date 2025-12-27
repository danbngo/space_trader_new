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
                marketPricesModifiedBy: 1.1,
                marketCargoAmountsModifiedBy: 0.8,
                commerceModifiedBy: 0.8,
                industryModifiedBy: 0.8,
                populationModifiedBy: 0.9,
                creditsModifiedBy: 0.8,
                shipyardNumShipsModifiedBy: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 1.5], [CARGO_TYPES.MEDICINE, 1.5]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //market, commerce, industry, population do not fully bounce back
        Object.assign(this.endEffects[0], {
            marketPricesModifiedBy: (1 + this.endEffects[0].marketPricesModifiedBy)/2,
            commerceModifiedBy: (1 + this.endEffects[0].commerceModifiedBy)/2,
            industryModifiedBy: (1 + this.endEffects[0].industryModifiedBy)/2,
            populationModifiedBy: (1 + this.endEffects[0].populationModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //happens when industry is getting out of hand
        const ratingsValid = planet.culture.industry >= 1.2
        const interferingEvent = News.hasNews(NEWS_TYPES.ENVIRONMENTAL_DISASTER, planet)
        return ratingsValid && !interferingEvent
    }
}
