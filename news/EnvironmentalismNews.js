class EnvironmentalismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s people are de-industrializing to save their planet's natural beauty!`,
            `${coloredName(planet)} has de-industrialized, giving their planet room to breathe again!`,
            NT.ENVIRONMENTALISM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.EXTREMELY_LOW,
                shipyardNumShips: CL.VERY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.NANITES, CL.EXTREMELY_LOW], [CARGO_TYPES.METAL, CL.EXTREMELY_LOW]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //market, economy, industry do not fully bounce back
        Object.assign(this.endEffects[0], {
            population: CL.SLIGHTLY_HIGH,
            shipyardNumShips: News.clHalfRegression(this.endEffects[0].shipyardNumShips),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            prestige: CL.HIGH,
        })
    }

    isValid() {
        const {planet} = this
        //happens when industry is getting out of hand
        const ratingsValid = planet.culture.industry >= CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.ENVIRONMENTALISM, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
