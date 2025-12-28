class CrimeWaveNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Massive crime wave on ${coloredName(planet)}!`,
            `The massive crime wave on ${coloredName(planet)} ends!`,
            NEWS_TYPES.CRIME_WAVE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                security: CL.HIGH,
                crime: CL.EXTREMELY_HIGH,
                blackMarketCargoAmounts: CL.VERY_HIGH,
                blackMarketPrices: CL.VERY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.EXTREMELY_LOW], [CARGO_TYPES.DRUGS, CL.EXTREMELY_LOW]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering crime increase
        Object.assign(this.endEffects[0], {
            crime: News.clHalfRegression(this.endEffects[0].crime),
            blackMarketPrices: News.clHalfRegression(this.endEffects[0].blackMarketPrices),
            blackMarketCargoAmounts: News.clHalfRegression(this.endEffects[0].blackMarketCargoAmounts),
        })
    }

    isValid() {
        const {planet} = this
        //wont happen if crime or security is already high
        const ratingsValid = planet.culture.crime < CL.MEDIUM && planet.culture.security < CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.CRIME_WAVE, ...NEWS_TYPES_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
