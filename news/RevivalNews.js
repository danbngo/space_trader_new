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
                civilizationMultipliers: new Civilization({
                    education: CL.LOW,
                    crime: CL.LOW,
                    corruption: CL.LOW
                }),
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH],
                    [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_LOW]
                ]))
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Don't revert ratings, but raise birthrates
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.HIGH,
            education: CL.NO_REGRESSION
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
    }

    isValid() {
        const {planet: p} = this
        //cant become even dumber if we're already low
        const ratingsValid = p.c.education > CL.LOW
        //planet must not already be in anarchy or puppet state
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.REVIVAL])
        return ratingsValid && !interferingEvent
    }
}
