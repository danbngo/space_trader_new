class ColonizationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins building a fleet to colonize resource-rich asteroids in the central belt!`,
            `${coloredName(planet)}'s colony ships have finished building settlements on resource laden asteroids!`,
            `${coloredName(planet)}'s colonization effort fails! Pirates raid their ships and hazards, scarcity and disease afflict their colonies!`,
            '',
            NT.COLONIZATION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                marketPrices: CL.HIGH,
                shipyardNumShips: CL.VERY_LOW,
                shipQuality: CL.LOW,
                marketCargoAmounts: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, CL.VERY_HIGH], [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_HIGH]]),
                credits: CL.LOW,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getHalfRegression())
        Object.assign(this.completeEffects[0], {
            economy: CL.HIGH,
            industry: CL.HIGH,
            territory: CL.HIGH,
            cargoPriceModifiers: NewsEffect.getInvertedCargoPriceModifiers(this.startEffects[0].cargoPriceModifiers),
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                cargoPriceModifiers: NewsEffect.getInvertedCargoPriceModifiers(this.startEffects[0].cargoPriceModifiers),
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        //better navy and economy (logistics) helps
        this.rollOutcome((planet.navy*planet.culture.economy), CL.SLIGHTLY_LOW)
    }

    isValid() {
        const {planet} = this
        const ratingsValid = planet.culture.population > CL.MEDIUM && (planet.navy > CL.MEDIUM)
        //basically dont do it if ANYTHING bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NT.COLONIZATION, ...NT_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
