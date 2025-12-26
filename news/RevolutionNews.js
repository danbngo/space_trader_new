class RevolutionNews extends News {
    constructor(planet = new Planet()) {
        const newGovType = rndMember(GOVERNMENT_TYPES_ALL.filter(g => g !== planet.culture.governmentType && g !== GOVERNMENT_TYPES.PUPPET_STATE));
        
        super(
            `The people of ${coloredName(planet)} revolt against the authorities!`,
            `${coloredName(planet)} stabilizes under new government: ${coloredName(newGovType)}!`,
            NEWS_TYPES.REVOLUTION, planet
        )

        const courthouseBuilding = this.planet.settlement.courthouse;

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                newGovernmentTypeType: GOVERNMENT_TYPES.ANARCHY,
                militaryRatingModifiedBy: 0.6,
                securityRatingModifiedBy: 0.7,
                crimeRatingModifiedBy: 1.4,
                commercialRatingModifiedBy: 0.8,
                industrialRatingModifiedBy: 0.8,
                creditsModifiedBy: 0.5,
                buildingsDisabled: courthouseBuilding ? [courthouseBuilding] : [],
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 1.5], [CARGO_TYPES.HOLOCUBES, 1.5]]),
                //relationsReset: true
            })
        ]

        //dont revert the government type back afterwards
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        this.endEffects[0].newGovernmentTypeType = newGovType;

        //government related ratings randomize a bit after a revolution
        Object.assign(this.endEffects[0], {
            militaryRatingModifiedBy: (rng(0.5,2,false) + this.endEffects[0].militaryRatingModifiedBy)/2,
            securityRatingModifiedBy: (rng(0.5,2,false)  + this.endEffects[0].securityRatingModifiedBy)/2,
            industrialRatingModifiedBy: (rng(0.5,2,false)  + this.endEffects[0].industrialRatingModifiedBy)/2,
            creditsModifiedBy: (rng(0.5,2,false)  + this.endEffects[0].creditsModifiedBy)/2,
            prestigeRatingModifiedBy: (rng(0.5,2,false)  + this.endEffects[0].prestigeRatingModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //high security prevents this
        const ratingsValid = planet.culture.securityRating < 1.5
        //planet must not already be in anarchy or puppet state
        const agencyValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.REVOLUTION, NEWS_TYPES.WAR]) || News.hasNewsTargeting(NEWS_TYPES.WAR, planet) ||
            News.planetHasAnyNews(planet, NEWS_TYPES_CRIME_PREVENTING)
        return ratingsValid && agencyValid && !interferingEvent
    }
}
