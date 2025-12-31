class RevolutionNews extends News {
    constructor(planet = new Planet()) {
        const governmentType = rndMember(GT_ALL.filter(g => g !== p.c.governmentType && g !== GT.PUPPET_STATE));
        
        super(
            p.c.governmentType != GT.ANARCHY ? `${coloredName(planet)}'s people have deposed the government and begin a glorious revolution!` :
            `${coloredName(planet)}'s people clamor for a government to take the reigns and end the anarchy they live in!`,
            `${coloredName(planet)} stabilizes under new government: ${coloredName(governmentType)}!`,
            `${coloredName(planet)}'s revolution fails! Chaos reigns!`,
            '',
            NT.REVOLUTION, planet
        )

        const courthouseBuilding = this.planet.settlement.courthouse;

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                governmentType: GT.ANARCHY ? null : GT.ANARCHY,
                civilizationMultipliers: new Civilization({
                    military: CL.VERY_LOW,
                    security: CL.VERY_LOW,
                    crime: CL.VERY_HIGH,
                    economy: CL.LOW,
                    industry: CL.LOW
                }),
                buildingsDisabled: courthouseBuilding ? [courthouseBuilding] : [],
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH], [CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH]]))
            })
        ]

        // Don't revert the government type back afterwards
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Government related ratings randomize a bit after a revolution
        this.completeEffects[0].governmentType = governmentType
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            military: (rng(0.5, 1.5, false) + 1) / 2,
            security: (rng(0.5, 1.5, false) + 1) / 2,
            industry: (rng(0.5, 1.5, false) + 1) / 2,
            wealth: (rng(0.5, 1.5, false) + 1) / 2,
            prestige: (rng(0.5, 1.5, false) + 1) / 2
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].governmentType = GT.ANARCHY
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            military: CL.NO_REGRESSION,
            security: CL.NO_REGRESSION,
            crime: CL.NO_REGRESSION,
            economy: CL.NO_REGRESSION,
            industry: CL.NO_REGRESSION,
            prestige: CL.VERY_LOW
        }))
        this.failEffects[0].buildingsEnabled = courthouseBuilding ? [] : []
        this.failEffects[0].cargoPriceMultipliers = new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.NO_REGRESSION]]))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
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
