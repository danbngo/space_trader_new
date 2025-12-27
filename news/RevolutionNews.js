class RevolutionNews extends News {
    constructor(planet = new Planet()) {
        const newGovType = rndMember(GOVERNMENT_TYPES_ALL.filter(g => g !== planet.culture.governmentType && g !== GOVERNMENT_TYPES.PUPPET_STATE));
        
        super(
            `${coloredName(planet)}'s people have deposed the government and begin a glorious revolution!`,
            `${coloredName(planet)} stabilizes under new government: ${coloredName(newGovType)}!`,
            NEWS_TYPES.REVOLUTION, planet
        )

        const courthouseBuilding = this.planet.settlement.courthouse;

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                newGovernmentType: GOVERNMENT_TYPES.ANARCHY,
                militaryModifiedBy: 0.6,
                securityModifiedBy: 0.7,
                crimeModifiedBy: 1.4,
                commerceModifiedBy: 0.8,
                industryModifiedBy: 0.8,
                creditsModifiedBy: 0.5,
                buildingsDisabled: courthouseBuilding ? [courthouseBuilding] : [],
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 1.5], [CARGO_TYPES.HOLOCUBES, 1.5]]),
                //relationsReset: true
            })
        ]

        //dont revert the government type back afterwards
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        this.endEffects[0].newGovernmentType = newGovType;

        //government related ratings randomize a bit after a revolution
        Object.assign(this.endEffects[0], {
            militaryModifiedBy: (rng(0.5,1.5,false) + this.endEffects[0].militaryModifiedBy)/2,
            securityModifiedBy: (rng(0.5,1.5,false)  + this.endEffects[0].securityModifiedBy)/2,
            industryModifiedBy: (rng(0.5,1.5,false)  + this.endEffects[0].industryModifiedBy)/2,
            creditsModifiedBy: (rng(0.5,1.5,false)  + this.endEffects[0].creditsModifiedBy)/2,
            prestigeModifiedBy: (rng(0.5,1.5,false)  + this.endEffects[0].prestigeModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //high security prevents this
        const ratingsValid = planet.culture.security < 1.5
        //planet must not already be in anarchy or puppet state
        const agencyValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.REVOLUTION, NEWS_TYPES.WAR]) || News.hasNewsTargeting(NEWS_TYPES.WAR, planet) ||
            News.planetHasAnyNews(planet, NEWS_TYPES_CRIME_PREVENTING)
        return ratingsValid && agencyValid && !interferingEvent
    }
}
