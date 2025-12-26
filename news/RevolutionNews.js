class RevolutionNews extends News {
    constructor(planet = new Planet(), startYear = gs.year) {
        const newGovType = rndMember(GOVERNMENT_TYPES_ALL.filter(g => g !== planet.culture.governmentType));
        
        super(
            `The people of ${coloredName(planet)} rise up in revolution!`,
            `${coloredName(planet)} stabilizes under new government: ${newGovType.name}!`,
            NEWS_TYPES.REVOLUTION, planet, null, startYear
        )

        const courthouseBuilding = this.planet.settlement.courthouse;

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                newGovernmentType: GOVERNMENT_TYPES.ANARCHY,
                militaryRatingModifiedBy: 0.6,
                securityRatingModifiedBy: 0.7,
                crimeRatingModifiedBy: 1.4,
                commercialRatingModifiedBy: 0.8,
                industrialRatingModifiedBy: 0.8,
                buildingsDisabled: courthouseBuilding ? [courthouseBuilding] : [],
                relationsReset: true
            })
        ]

        //dont revert the government type back afterwards
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        this.endEffects[0].newGovernmentType = newGovType;

        //government related ratings randomize a bit after a revolution
        Object.assign(this.endEffects[0], {
            militaryRatingModifiedBy: (rng(0.5,2,false) + this.endEffects[0].militaryRatingModifiedBy)/2,
            securityRatingModifiedBy: (rng(0.5,2,false)  + this.endEffects[0].securityRatingModifiedBy)/2,
        })
    }

    static isValid(planet = new Planet()) {
        //high security prevents this
        const ratingsValid = planet.culture.securityRating < 1.5
        //planet must not already be in anarchy or puppet state
        const agencyValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const interferingEvent =
            News.hasNews(planet, NEWS_TYPES.CIVIL_WAR) || News.hasNews(planet, NEWS_TYPES.REVOLUTION) ||
            News.hasNews(planet, NEWS_TYPES.WAR) || News.hasNewsTargeting(planet, NEWS_TYPES.WAR) ||
            News.hasNewsTargeting(planet, NEWS_TYPES.BOMBARDMENT)
        return ratingsValid && agencyValid && !interferingEvent
    }
}
