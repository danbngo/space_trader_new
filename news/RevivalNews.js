class RevivalNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is undergoing a religious revival!`,
            `${coloredName(planet)}'s religious revival has ended!`,
            ``,
            ``,
            NT.REVIVAL, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                officerQuality: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH], [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_LOW]]),
                blackMarketCargoAmounts: CL.LOW,
                blackMarketPrices: CL.LOW,
                //relationsReset: true
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //dont revert ratings, but raise birthrates
        Object.assign(this.endEffects[0], {
            population: CL.HIGH,
            officerQuality: CL.NO_REGRESSION,
        })
    }

    isValid() {
        const {planet} = this
        //cant become even dumber if we're already low
        const ratingsValid = planet.culture.officerQuality > CL.LOW
        //planet must not already be in anarchy or puppet state
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.REVIVAL])
        return ratingsValid && !interferingEvent
    }
}
