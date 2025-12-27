class RevivalNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is undergoing a religious revival!`,
            `${coloredName(planet)}'s religious revival has ended!`,
            NEWS_TYPES.REVIVAL, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                officerQuality: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, 1.5], [CARGO_TYPES.ISOTOPES, 0.5]]),
                blackMarketCargoAmounts: 0.8,
                blackMarketPrices: 0.7,
                //relationsReset: true
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //dont revert ratings, but raise birthrates
        Object.assign(this.endEffects[0], {
            population: 1.4,
            officerQuality: 1,
        })
    }

    isValid() {
        const {planet} = this
        //cant become even dumber if we're already low
        const ratingsValid = planet.culture.officerQuality > 0.75
        //planet must not already be in anarchy or puppet state
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.REVIVAL])
        return ratingsValid && !interferingEvent
    }
}
