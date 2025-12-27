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
                security: 0.7,
                crime: 1.4,
                military: 0.9,
                blackMarketCargoAmounts: 1.4,
                blackMarketPrices: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 0.5], [CARGO_TYPES.DRUGS, 0.5]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering crime increase
        Object.assign(this.endEffects[0], {
            crime: (1 + this.endEffects[0].crime)/2,
            blackMarketPrices: (1 + this.endEffects[0].blackMarketPrices)/2,
            blackMarketCargoAmounts: (1 + this.endEffects[0].blackMarketCargoAmounts)/2,
        })
    }

    isValid() {
        const {planet} = this
        //wont happen if crime or security is already high
        const ratingsValid = planet.culture.crime < 0.75
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.CRIME_WAVE, ...NEWS_TYPES_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
