class CivilWarNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is being torn apart by two factions! Civil war has begun!`,
            `${coloredName(planet)}'s civil war ends with minimal fighting as the two sides are able to reach a political compromise!`,
            `${coloredName(planet)}'s civil war ends in mass devastation as one side brutally crushes the other!`,
            '',
            NT.CIVIL_WAR, planet
        )

        const buildingsDisabled = rndMembers(News.calcDestroyableBuildings(this.planet), rng(3, 1), true)
        const newGovernmentType = Math.random() > .5 ? this.p.c.governmentType : rndMember(GT_ALL.filter(g => g !== GT.PUPPET_STATE))

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    territory: CL.SLIGHTLY_LOW,
                    army: CL.VERY_LOW,
                    navy: CL.VERY_LOW,
                    security: CL.VERY_LOW,
                    economy: CL.VERY_LOW,
                    industry: CL.VERY_LOW,
                    reserves: CL.VERY_LOW,
                    inflation: CL.HIGH,
                    crime: CL.SLIGHTLY_HIGH,
                    corruption: CL.SLIGHTLY_HIGH,
                    wealth: CL.LOW,
                    prestige: CL.LOW,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.ASTRONOMICAL], [CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_HIGH]])),
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[0], {newGovernmentType})

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.failEffects[0], {
            buildingsDisabled,
            newGovernmentType,
            population: CL.VERY_LOW,
            territory: CL.NO_REGRESSION,
            army: CL.LOW/CL.VERY_LOW,
            navy: CL.LOW/CL.VERY_LOW,
            security: CL.LOW/CL.VERY_LOW,
            economy: CL.LOW/CL.VERY_LOW,
            industry: CL.LOW/CL.VERY_LOW,
            reserves: CL.LOW/CL.VERY_LOW,
            inflation: CL.NO_REGRESSION,
            crime: CL.HIGH/CL.SLIGHTLY_HIGH,
            wealth: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION,
        })
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome(0.5*(p.c.culture)/p.c.population/p.c.corruption, CL.HIGH)
    }
    isValid() {
        const {planet: p} = this
        const ratingsValid = p.c.army > CL.VERY_HIGH || p.c.security > CL.VERY_HIGH || p.c.culture < CL.VERY_LOW
        const interferingEvent =
            News.planetHasAnyNews(p, NT.GOVERNANCE_PREVENTING) ||
            News.planetHasAnyNewsTargeting(p, NT_WARLIKE)
        return ratingsValid && !interferingEvent
    }
}
