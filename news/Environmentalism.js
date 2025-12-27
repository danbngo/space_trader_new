class Environmentalism extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s people are de-industrializing to save their planet's natural beauty!`,
            `${coloredName(planet)} has de-industrialized, giving their planet room to breathe again!`,
            NEWS_TYPES.ENVIRONMENTALISM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                commerceModifiedBy: 0.9,
                industryModifiedBy: 0.4,
                shipyardNumShipsModifiedBy: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.NANITES, 0.5], [CARGO_TYPES.METAL, 0.5]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //market, commerce, industry do not fully bounce back
        Object.assign(this.endEffects[0], {
            populationModifiedBy: 1.2,
            shipyardNumShipsModifiedBy: (1 + this.endEffects[0].shipyardNumShipsModifiedBy)/2,
            commerceModifiedBy: (1 + this.endEffects[0].commerceModifiedBy)/2,
            industryModifiedBy: (1 + this.endEffects[0].industryModifiedBy)/2,
            prestigeModifiedBy: 1.2,
        })
    }

    isValid() {
        const {planet} = this
        //happens when industry is getting out of hand
        const ratingsValid = planet.culture.industry >= 1.5
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.ENVIRONMENTALISM, ...NEWS_TYPES_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
