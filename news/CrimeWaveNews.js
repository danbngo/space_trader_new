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
                securityRatingModifiedBy: 0.7,
                crimeRatingModifiedBy: 1.4,
                militaryRatingModifiedBy: 0.9,
                blackMarketCargoAmountsModifiedBy: 1.4,
                blackMarketPricesModifiedBy: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 0.5], [CARGO_TYPES.DRUGS, 0.5]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering crime increase
        Object.assign(this.endEffects[0], {
            crimeRatingModifiedBy: (1 + this.endEffects[0].crimeRatingModifiedBy)/2,
            blackMarketPricesModifiedBy: (1 + this.endEffects[0].blackMarketPricesModifiedBy)/2,
            blackMarketCargoAmountsModifiedBy: (1 + this.endEffects[0].blackMarketCargoAmountsModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //wont happen if crime or security is already high
        const ratingsValid = planet.culture.crimeRating < 1 && planet.culture.securityRating < 2
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.CRIME_WAVE, ...NEWS_TYPES_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
