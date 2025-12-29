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
                marketCargoAmounts: CL.LOW,
                marketPrices: CL.HIGH,
                credits: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, CL.EXTREMELY_HIGH], [CARGO_TYPES.NANITES, CL.ASTRONOMICAL]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[0], {
            credits: News.clHalfRegression(this.completeEffects[0].credits),
            economy: CL.HIGH,
            industry: CL.HIGH,
            buildingsEnabled
        })

        this.failEffects = this.startEffects.map(effect => effect.getHalfRegression())
        Object.assign(this.failEffects[0], {
            cargoPriceModifiers: NewsEffect.getInvertedCargoPriceModifiers(this.startEffects[0].cargoPriceModifiers)
        })
    }

    determineOutcome() {
        const {planet} = this
        // Higher economy = more likely to succeed
        this.rollOutcome(planet.culture.economy, CL.LOW)
    }

    isValid() {
        const {planet} = this
        //must be missing at least one building OR industry is low and credits are high
        const buildingsValid = News.calcRepairableBuildings(planet).length > 0
        const ratingsValid = planet.culture.industry < CL.LOW && (planet.settlement.goods > CL.SLIGHTLY_HIGH || planet.settlement.wealth > CL.SLIGHTLY_HIGH)
        const interferingEvent =
            News.planetHasAnyNewsTargeting(planet, NT_DANGEROUS) ||
            News.planetHasAnyNews(planet, [NT.CONSTRUCTION, ...NT_ECONOMY_PREVENTING])
        return (buildingsValid || ratingsValid) && !interferingEvent
    }
}
