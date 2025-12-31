class CivilWarNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is being torn apart by two factions! Civil war has begun!`,
            `${coloredName(planet)}'s civil war is averted with minimal fighting as the two sides are able to reach a political compromise!`,
            `${coloredName(planet)}'s civil war ends in mass devastation as one side brutally crushes the other!`,
            '',
            NT.CIVIL_WAR, planet
        )

        const buildingsDisabled = rndMembers(News.calcDestroyableBuildings(this.planet), rng(3, 1), true)
        const governmentType = Math.random() > .5 ? this.planet.c.governmentType : rndMember(GT_ALL.filter(g => g !== GT.PUPPET_STATE))

        this.addPlanetEffect(
            {
                territory: CL.SLIGHTLY_LOW,
                army: CL.VERY_LOW,
                security: CL.VERY_LOW,
                economy: CL.VERY_LOW,
                industry: CL.VERY_LOW,
                reserves: CL.LOW,
                prestige: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.ASTRONOMICAL], [CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_HIGH]])),
            },
            {
                governmentType,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                buildingsDisabled,
                governmentType,
                population: CL.VERY_LOW,
                territory: CL.SLIGHTLY_LOW,
                army: CL.LOW,
                security: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                reserves: CL.LOW,
                crime: CL.HIGH,
                wealth: CL.LOW,
                prestige: CL.LOW,
                taxes: CL.HIGH,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome(p.c.culture/p.c.population/p.c.corruption, CL.HIGH)
    }
    
    shouldCancel() {
        const {planet: p} = this
        // Civil war ends if planet becomes puppet state (external power ends conflict)
        return p.c.governmentType === GT.PUPPET_STATE
    }
    
    isValid() {
        const {planet: p} = this
        //this one really hurts, lets do it if army/security is too high
        const ratingsValid = (p.c.army > CL.VERY_HIGH || p.c.security > CL.VERY_HIGH) && p.c.culture < CL.LOW
        const interferingEvent =
            News.planetHasAnyNews(p, NT.GOVERNANCE_PREVENTING) ||
            News.planetHasAnyNewsTargeting(p, NT_WARLIKE)
        return ratingsValid && !interferingEvent
    }
}
