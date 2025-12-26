class CivilStrifeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Civil strife is consuming ${coloredName(planet)}!`,
            `${coloredName(planet)}'s civil strife is brought to an end!`,
            NEWS_TYPES.CIVIL_STRIFE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                militaryRatingModifiedBy: 0.9,
                securityRatingModifiedBy: 0.6,
                crimeRatingModifiedBy: 1.3,
                commercialRatingModifiedBy: 0.8,
                industrialRatingModifiedBy: 0.6,
                creditsModifiedBy: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 1.5]]), //this is the only thing that normalizes after
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security decrease
        Object.assign(this.endEffects[0], {
            securityRatingModifiedBy: (1 + this.endEffects[0].securityRatingModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //planet must not already be in anarchy or puppet state
        const agencyValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const interferingEvent =
            News.hasNews(planet, NEWS_TYPES.CIVIL_STRIFE) || News.hasNews(planet, NEWS_TYPES.CIVIL_WAR) || News.hasNews(planet, NEWS_TYPES.REVOLUTION)
        return agencyValid && !interferingEvent
    }
}
