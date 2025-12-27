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
                industryModifiedBy: 0.8,
                shipQualityModifiedBy: 0.9,
                officerQualityModifiedBy: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, 1.5]]),
                //relationsReset: true
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //dont revert ratings, but raise birthrates
        Object.assign(this.endEffects[0], {
            populationModifiedBy: 1.4,
            industryModifiedBy: 1,
            shipQualityModifiedBy: 1,
            officerQualityModifiedBy: 1,
        })
    }

    isValid() {
        const {planet} = this
        //high security prevents this
        const ratingsValid = planet.culture.security < 1.5
        //planet must not already be in anarchy or puppet state
        const agencyValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.REVIVAL])
        return ratingsValid && agencyValid && !interferingEvent
    }
}
