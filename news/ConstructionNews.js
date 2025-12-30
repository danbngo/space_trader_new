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

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.SLIGHTLY_LOW,
                reserves: CL.LOW,
                inflation: CL.HIGH,
                wealth: CL.LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.METAL, CL.EXTREMELY_HIGH], [CARGO_TYPES.NANITES, CL.ASTRONOMICAL]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[0], {
            wealth: News.clHalfRegression(this.completeEffects[0].wealth),
            economy: CL.HIGH,
            industry: CL.HIGH,
            buildingsEnabled
        })

        this.failEffects = this.startEffects.map(effect => effect.getHalfRegression())
        Object.assign(this.failEffects[0], {
            cargoPriceMultipliers: NewsEffect.getInvertedCargoPriceMultipliers(this.startEffects[0].cargoPriceMultipliers)
        })
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher economy = more likely to succeed
        this.rollOutcome(planet.civilization.economy, CL.LOW)
    }

    isValid() {
        const {planet: p} = this
        //must be missing at least one building OR industry is low and credits are high
        const buildingsValid = News.calcRepairableBuildings(planet).length > 0
        const ratingsValid = planet.civilization.industry < CL.LOW && (planet.settlement.reserves > CL.SLIGHTLY_HIGH || planet.civilization.wealth > CL.SLIGHTLY_HIGH)
        const interferingEvent =
            News.planetHasAnyNewsTargeting(planet, NT_DANGEROUS) ||
            News.planetHasAnyNews(planet, [NT.CONSTRUCTION, ...NT_ECONOMY_PREVENTING])
        return (buildingsValid || ratingsValid) && !interferingEvent
    }
}
