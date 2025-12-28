class RevolutionNews extends News {
    constructor(planet = new Planet()) {
        const newGovernmentType = rndMember(GT_ALL.filter(g => g !== planet.culture.governmentType && g !== GT.PUPPET_STATE));
        
        super(
            planet.culture.governmentType != GT.ANARCHY ? `${coloredName(planet)}'s people have deposed the government and begin a glorious revolution!` :
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
                military: CL.VERY_LOW,
                security: CL.VERY_LOW,
                crime: CL.VERY_HIGH,
                economy: CL.LOW,
                industry: CL.LOW,
                //credits: CL.VERY_LOW,
                buildingsDisabled: courthouseBuilding ? [courthouseBuilding] : [],
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH], [CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH]]),
                //relationsReset: true
            })
        ]

        //dont revert the government type back afterwards
        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //government related ratings randomize a bit after a revolution
        Object.assign(this.endEffects[0], {
            newGovernmentType,
            military: (rng(0.5,1.5,false) + this.endEffects[0].military)/2,
            security: (rng(0.5,1.5,false)  + this.endEffects[0].security)/2,
            industry: (rng(0.5,1.5,false)  + this.endEffects[0].industry)/2,
            credits: (rng(0.5,1.5,false)  + this.endEffects[0].credits)/2,
            prestige: (rng(0.5,1.5,false)  + this.endEffects[0].prestige)/2,
        })

        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                newGovernmentType: GT.ANARCHY,
                military: CL.NO_REGRESSION,
                security: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW,
                buildingsEnabled: courthouseBuilding ? [] : [],
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.NO_REGRESSION]]),
            })
        ]
    }

    determineEnding() {
        const {planet} = this
        // Higher military and prestige = more likely to succeed
        const successProbability = (planet.culture.military + planet.culture.prestige) / 2
        this.failed = Math.random() > successProbability
    }

    isValid() {
        const {planet} = this
        //a generally robust economy/govt less prone to this
        const ratingsValid = planet.culture.security < CL.MEDIUM || planet.culture.military < CL.MEDIUM || planet.culture.prestige < CL.MEDIUM || planet.culture.crime > CL.MEDIUM || planet.culture.security < CL.MEDIUM || planet.culture.economy < CL.MEDIUM
        //planet must not be puppet state (anarcy is fine otherwise how do we get back out of it)
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.REVOLUTION, NT.WAR]) || News.hasNewsTargeting(NT.WAR, planet) ||
            News.planetHasAnyNews(planet, NT_CRIME_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
