class RevolutionNews extends News {
    constructor(planet = new Planet()) {
        const newGovernmentType = rndMember(GT_ALL.filter(g => g !== planet.civilization.governmentType && g !== GT.PUPPET_STATE));
        
        super(
            planet.civilization.governmentType != GT.ANARCHY ? `${coloredName(planet)}'s people have deposed the government and begin a glorious revolution!` :
            `${coloredName(planet)}'s people clamor for a government to take the reigns and end the anarchy they live in!`,
            `${coloredName(planet)} stabilizes under new government: ${coloredName(newGovernmentType)}!`,
            `${coloredName(planet)}'s revolution fails! Chaos reigns!`,
            '',
            NT.REVOLUTION, planet
        )

        const courthouseBuilding = this.planet.settlement.courthouse;

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                newGovernmentType: GT.ANARCHY ? null : GT.ANARCHY,
                army: CL.VERY_LOW,
                navy: CL.VERY_LOW,
                security: CL.VERY_LOW,
                crime: CL.VERY_HIGH,
                economy: CL.LOW,
                industry: CL.LOW,
                //credits: CL.VERY_LOW,
                buildingsDisabled: courthouseBuilding ? [courthouseBuilding] : [],
                cargoPriceMultipliers: new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH], [CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH]]),
                //relationsReset: true
            })
        ]

        //dont revert the government type back afterwards
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())

        //government related ratings randomize a bit after a revolution
        Object.assign(this.completeEffects[0], {
            newGovernmentType,
            army: (rng(0.5,1.5,false) + this.completeEffects[0].army)/2,
            navy: (rng(0.5,1.5,false) + this.completeEffects[0].navy)/2,
            security: (rng(0.5,1.5,false)  + this.completeEffects[0].security)/2,
            industry: (rng(0.5,1.5,false)  + this.completeEffects[0].industry)/2,
            wealth: (rng(0.5,1.5,false)  + this.completeEffects[0].wealth)/2,
            prestige: (rng(0.5,1.5,false)  + this.completeEffects[0].prestige)/2,
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                newGovernmentType: GT.ANARCHY,
                army: CL.NO_REGRESSION,
                navy: CL.NO_REGRESSION,
                security: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW,
                buildingsEnabled: courthouseBuilding ? [] : [],
                cargoPriceMultipliers: new Map([[CARGO_TYPES.WEAPONS, CL.NO_REGRESSION]]),
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Higher military and prestige = more likely to succeed
        const successProbability = (planet.civilization.military + planet.civilization.prestige) / 2
        this.failed = Math.random() > successProbability
    }

    isValid() {
        const {planet} = this
        //a generally robust economy/govt less prone to this
        const ratingsValid = planet.civilization.security < CL.MEDIUM || planet.civilization.military < CL.MEDIUM || planet.civilization.prestige < CL.MEDIUM || planet.civilization.crime > CL.MEDIUM || planet.civilization.security < CL.MEDIUM || planet.civilization.economy < CL.MEDIUM
        //planet must not be puppet state (anarcy is fine otherwise how do we get back out of it)
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.REVOLUTION, NT.WAR]) || News.hasNewsTargeting(NT.WAR, planet) ||
            News.planetHasAnyNews(planet, NT_CRIME_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
