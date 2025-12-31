class ConstructionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins a grand revitalization project to overhaul its infrastructure!`,
            `${coloredName(planet)} completes its grand revitalization project, vastly improving its infrastructure!`,
            `${coloredName(planet)}'s construction project devolves into an unfinished boondoggle through waste and mismanagement!`,
            '',
            NT.CONSTRUCTION, planet
        )

        const buildingsEnabled = rndMembers(News.calcRepairableBuildings(planet), rng(3,1), true);

        this.addPlanetEffect(
            {
                reserves: CL.LOW,
                economy: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_HIGH,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.METAL, CL.EXTREMELY_HIGH], [CARGO_TYPES.NANITES, CL.ASTRONOMICAL]])),
            },
            {
                reserves: CL.LOW,
                taxes: CL.SLIGHTLY_HIGH,
                economy: CL.HIGH,
                industry: CL.HIGH,
                buildingsEnabled,
            },
            {
                reserves: CL.LOW,
                taxes: CL.HIGH,
                inflation: CL.SLIGHTLY_HIGH,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher economy = more likely to succeed
        this.rollOutcome(p.c.economy, CL.LOW)
    }

    isValid() {
        const {planet: p} = this
        //must be missing at least one building OR industry is low and credits are high
        const buildingsValid = News.calcRepairableBuildings(p).length > 0
        const ratingsValid = p.c.industry < CL.LOW && (p.c.reserves > CL.SLIGHTLY_HIGH || p.c.wealth > CL.SLIGHTLY_HIGH)
        const interferingEvent = News.planetHasAnyNewsTargeting(p, NT_DANGEROUS) || News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING)
        return (buildingsValid || ratingsValid) && !interferingEvent
    }
}
