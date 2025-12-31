class RevolutionNews extends News {
    constructor(planet = new Planet()) {
        const governmentType = rndMember(GT_ALL.filter(g => g !== planet.c.governmentType && g !== GT.PUPPET_STATE));
        
        super(
            planet.c.governmentType != GT.ANARCHY ? `${coloredName(planet)}'s people have flooded the streets of the capital and begin a glorious revolution!` :
            `${coloredName(planet)}'s people have flooded the streets of the capital, clamoring for a government to take the reigns and end the anarchy they live in!`,
            `${coloredName(planet)} stabilizes under new government: ${coloredName(governmentType)}!`,
            `${coloredName(planet)}'s revolution fails! The regime gathers its forces and flattens the unruly masses with an iron fist!`,
            '',
            NT.REVOLUTION, planet
        )

        //todo: make this event and ones like it destroy a random sampling of buildings
        this.addPlanetEffect(
            {
                governmentType: GT.ANARCHY ? null : GT.ANARCHY,
                military: CL.VERY_LOW,
                security: CL.VERY_LOW,
                crime: CL.VERY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH], [CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH]]))
            },
            {
                governmentType,
                military: rng(0.5,2,false),
                navy: rng(0.5,2,false),
                economy: rng(0.5,2,false),
                security: rng(0.5,2,false),
                education: rng(0.5,2,false),
                corruption: rng(0.5,2,false),
                culture: rng(0.5,2,false),
                taxes: rng(0.5,2,false),
            },
            {
                governmentType: GT.ANARCHY,
                military: CL.LOW,
                security: CL.LOW,
                culture: CL.LOW,
                prestige: CL.LOW,
                corruption: CL.HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher culture, lower military helps
        this.rollOutcome((p.c.culture * p.c.education / p.c.army / p.c.security) / 2)
    }

    shouldCancel() {
        const {planet: p} = this
        // Revolution ends if planet becomes puppet state (external control imposed)
        return p.c.governmentType === GT.PUPPET_STATE
    }

    isValid() {
        const {planet: p} = this
        //a generally robust economy/govt less prone to this
        const ratingsValid = p.c.security < CL.MEDIUM || p.c.military < CL.MEDIUM || p.c.prestige < CL.MEDIUM || p.c.crime > CL.MEDIUM || p.c.security < CL.MEDIUM || p.c.economy < CL.MEDIUM
        //planet must not be puppet state (anarcy is fine otherwise how do we get back out of it)
        const interferingEvent =
            News.planetHasAnyNews(p, NT_GOVERNANCE_PREVENTING) ||
            News.planetHasAnyNews(p, NT_CRIME_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
