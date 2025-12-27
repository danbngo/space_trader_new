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
                commerce: 0.9,
                industry: 0.4,
                shipyardNumShips: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.NANITES, 0.5], [CARGO_TYPES.METAL, 0.5]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //market, commerce, industry do not fully bounce back
        Object.assign(this.endEffects[0], {
            population: 1.2,
            shipyardNumShips: (1 + this.endEffects[0].shipyardNumShips)/2,
            commerce: (1 + this.endEffects[0].commerce)/2,
            industry: (1 + this.endEffects[0].industry)/2,
            prestige: 1.2,
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
