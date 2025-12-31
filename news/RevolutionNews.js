class RevolutionNews extends News {
    constructor(planet = new Planet()) {
        const governmentType = rndMember(GT_ALL.filter(g => g !== planet.c.governmentType && g !== GT.PUPPET_STATE));
        
        super(
            planet.c.governmentType != GT.ANARCHY ? `${coloredName(planet)}'s people have deposed the government and begin a glorious revolution!` :
            `${coloredName(planet)}'s people clamor for a government to take the reigns and end the anarchy they live in!`,
            `${coloredName(planet)} stabilizes under new government: ${coloredName(governmentType)}!`,
            `${coloredName(planet)}'s revolution fails! Chaos reigns!`,
            '',
            NT.REVOLUTION, planet
        )

        const courthouseBuilding = this.planet.settlement.courthouse;

        this.addPlanetEffect(
            {
                governmentType: GT.ANARCHY ? null : GT.ANARCHY,
                buildingsDisabled: courthouseBuilding ? [courthouseBuilding] : [],
                military: CL.VERY_LOW,
                security: CL.VERY_LOW,
                crime: CL.VERY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH], [CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH]]))
            },
            {
                governmentType,
                military: (rng(0.5, 1.5, false) + 1) / 2,
                security: (rng(0.5, 1.5, false) + 1) / 2,
                prestige: (rng(0.5, 1.5, false) + 1) / 2
            },
            {
                governmentType: GT.ANARCHY,
                buildingsEnabled: [],
                military: CL.NO_REGRESSION,
                security: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.NO_REGRESSION]]))
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher military and prestige = more likely to succeed
        this.rollOutcome((p.c.military + p.c.prestige) / 2)
    }

    isValid() {
        const {planet: p} = this
        //a generally robust economy/govt less prone to this
        const ratingsValid = p.c.security < CL.MEDIUM || p.c.military < CL.MEDIUM || p.c.prestige < CL.MEDIUM || p.c.crime > CL.MEDIUM || p.c.security < CL.MEDIUM || p.c.economy < CL.MEDIUM
        //planet must not be puppet state (anarcy is fine otherwise how do we get back out of it)
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.REVOLUTION, NT.WAR]) || News.hasNewsTargeting(NT.WAR, planet) ||
            News.planetHasAnyNews(planet, NT_CRIME_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
