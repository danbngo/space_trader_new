class RevolutionNews extends News {
    constructor(planet = new Planet()) {
        const newGovType = rndMember(GOVERNMENT_TYPES_ALL.filter(g => g !== planet.culture.governmentType && g !== GOVERNMENT_TYPES.PUPPET_STATE));
        
        super(
            planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY ? `${coloredName(planet)}'s people have deposed the government and begin a glorious revolution!` :
            `${coloredName(planet)}'s people clamor for a government to take the reigns and end the anarchy they live in!`,
            `${coloredName(planet)} stabilizes under new government: ${coloredName(newGovType)}!`,
            NEWS_TYPES.REVOLUTION, planet
        )

        const courthouseBuilding = this.planet.settlement.courthouse;

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                newGovernmentType: GOVERNMENT_TYPES.ANARCHY ? null : GOVERNMENT_TYPES.ANARCHY,
                military: CL.VERY_LOW,
                security: CL.VERY_LOW,
                crime: CL.VERY_HIGH,
                commerce: CL.LOW,
                industry: CL.LOW,
                credits: CL.VERY_LOW,
                buildingsDisabled: courthouseBuilding ? [courthouseBuilding] : [],
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH], [CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH]]),
                //relationsReset: true
            })
        ]

        //dont revert the government type back afterwards
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        this.endEffects[0].newGovernmentType = newGovType;

        //government related ratings randomize a bit after a revolution
        Object.assign(this.endEffects[0], {
            military: (rng(0.5,1.5,false) + this.endEffects[0].military)/2,
            security: (rng(0.5,1.5,false)  + this.endEffects[0].security)/2,
            industry: (rng(0.5,1.5,false)  + this.endEffects[0].industry)/2,
            credits: (rng(0.5,1.5,false)  + this.endEffects[0].credits)/2,
            prestige: (rng(0.5,1.5,false)  + this.endEffects[0].prestige)/2,
        })
    }

    isValid() {
        const {planet} = this
        //a generally robust economy/govt less prone to this
        const ratingsValid = planet.culture.security < CL.MEDIUM || planet.culture.military < CL.MEDIUM || planet.culture.prestige < CL.MEDIUM || planet.culture.crime > CL.MEDIUM || planet.culture.security < CL.MEDIUM || planet.culture.commerce < CL.MEDIUM
        //planet must not be puppet state (anarcy is fine otherwise how do we get back out of it)
        const agencyValid = planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.REVOLUTION, NEWS_TYPES.WAR]) || News.hasNewsTargeting(NEWS_TYPES.WAR, planet) ||
            News.planetHasAnyNews(planet, NEWS_TYPES_CRIME_PREVENTING)
        return ratingsValid && agencyValid && !interferingEvent
    }
}
