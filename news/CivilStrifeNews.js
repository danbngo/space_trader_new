class CivilStrifeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s people are rioting in the streets against their government!'`,
            `${coloredName(planet)}'s rioting is quelled!`,
            NEWS_TYPES.CIVIL_STRIFE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                militaryModifiedBy: 0.9,
                securityModifiedBy: 0.6,
                crimeModifiedBy: 1.3,
                commerceModifiedBy: 0.8,
                industryModifiedBy: 0.6,
                creditsModifiedBy: 0.7,
                marketCargoAmountsModifiedBy: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 1.5]]), //this is the only thing that normalizes after
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            securityModifiedBy: (1 + this.endEffects[0].securityModifiedBy)/2,
            prestigeModifiedBy: 0.9,
            commerceModifiedBy: (1 + this.endEffects[0].commerceModifiedBy)/2,
            marketCargoAmountsModifiedBy: (1 + this.endEffects[0].marketCargoAmountsModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //planet must not already be in anarchy or puppet state
        const agencyValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.CIVIL_STRIFE, NEWS_TYPES.CIVIL_WAR, NEWS_TYPES.REVOLUTION])
        return agencyValid && !interferingEvent
    }
}
