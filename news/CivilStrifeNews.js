class CivilStrifeNews extends News {
    constructor(planet = new Planet(), startYear = gs.year) {
        const newGovType = rndMember(GOVERNMENT_TYPES_ALL.filter(g => g !== planet.culture.governmentType));
        
        super(
            `Civil strife is consuming ${coloredName(planet)}!`,
            `${coloredName(planet)}'s civil strife is brought to an end!`,
            NEWS_TYPES.CIVIL_STRIFE, planet, null, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                militaryRatingModifiedBy: 0.9,
                securityRatingModifiedBy: 0.6,
                crimeRatingModifiedBy: 1.3,
                commercialRatingModifiedBy: 0.8,
                industrialRatingModifiedBy: 0.6,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security decrease
        Object.assign(this.endEffects[0], {
            securityRatingModifiedBy: (1 + this.endEffects[0].securityRatingModifiedBy)/1,
        })
    }

    static isValid(planet = new Planet()) {
        //planet must not already be in anarchy or puppet state
        const agencyValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const interferingEvent =
            News.hasNews(planet, NEWS_TYPES.CIVIL_WAR) || News.hasNews(planet, NEWS_TYPES.REVOLUTION) ||
            News.hasNewsTargeting(planet, NEWS_TYPES.BOMBARDMENT)
        return agencyValid && !interferingEvent
    }
}
