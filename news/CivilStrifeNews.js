class CivilStrifeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s people are rioting in the streets against their oppressive government!'`,
            `${coloredName(planet)}'s rioting is quelled!`,
            NEWS_TYPES.CIVIL_STRIFE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                military: CL.SLIGHTLY_LOW,
                security: CL.VERY_LOW,
                crime: CL.HIGH,
                commerce: CL.LOW,
                industry: CL.VERY_LOW,
                credits: CL.LOW,
                marketCargoAmounts: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH]]), //this is the only thing that normalizes after
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            security: News.clHalfRegression(this.endEffects[0].security),
            prestige: CL.SLIGHTLY_LOW,
            commerce: News.clHalfRegression(this.endEffects[0].commerce),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
        })
    }

    isValid() {
        const {planet} = this
        //more likely if security is too high
        const ratingsValid = planet.culture.security > 1.5
        //planet must not already be in anarchy or puppet state
        const agencyValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.CIVIL_STRIFE, NEWS_TYPES.CIVIL_WAR, NEWS_TYPES.REVOLUTION])
        return ratingsValid && agencyValid && !interferingEvent
    }
}
