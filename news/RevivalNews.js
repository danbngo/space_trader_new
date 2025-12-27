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
                officerQualityModifiedBy: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, 1.5], [CARGO_TYPES.ISOTOPES, 0.5]]),
                //relationsReset: true
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //dont revert ratings, but raise birthrates
        Object.assign(this.endEffects[0], {
            populationModifiedBy: 1.4,
            officerQualityModifiedBy: 1,
        })
    }

    isValid() {
        const {planet} = this
        //cant become even dumber if we're already low
        const ratingsValid = planet.culture.officerQuality > 0.75
        //planet must not already be in anarchy or puppet state
        const agencyValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.REVIVAL])
        return ratingsValid && agencyValid && !interferingEvent
    }
}
