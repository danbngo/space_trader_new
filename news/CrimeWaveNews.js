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
                securityModifiedBy: 0.7,
                crimeModifiedBy: 1.4,
                militaryModifiedBy: 0.9,
                blackMarketCargoAmountsModifiedBy: 1.4,
                blackMarketPricesModifiedBy: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 0.5], [CARGO_TYPES.DRUGS, 0.5]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering crime increase
        Object.assign(this.endEffects[0], {
            crimeModifiedBy: (1 + this.endEffects[0].crimeModifiedBy)/2,
            blackMarketPricesModifiedBy: (1 + this.endEffects[0].blackMarketPricesModifiedBy)/2,
            blackMarketCargoAmountsModifiedBy: (1 + this.endEffects[0].blackMarketCargoAmountsModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //wont happen if crime or security is already high
        const ratingsValid = planet.culture.crime < 1 && planet.culture.security < 2
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.CRIME_WAVE, ...NEWS_TYPES_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
