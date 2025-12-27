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
                military: 0.9,
                security: 0.6,
                crime: 1.3,
                commerce: 0.8,
                industry: 0.6,
                credits: 0.7,
                marketCargoAmounts: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 1.5]]), //this is the only thing that normalizes after
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            security: (1 + this.endEffects[0].security)/2,
            prestige: 0.9,
            commerce: (1 + this.endEffects[0].commerce)/2,
            industry: (1 + this.endEffects[0].industry)/2,
            marketCargoAmounts: (1 + this.endEffects[0].marketCargoAmounts)/2,
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
