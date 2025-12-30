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
                inflation: CL.HIGH,
                navy: CL.VERY_LOW, // ships sent to colonize
                technology: CL.LOW,
                reserves: CL.LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.METAL, CL.VERY_HIGH], [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_HIGH]]),
                wealth: CL.LOW, // funding colonization
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getHalfRegression())
        Object.assign(this.completeEffects[0], {
            economy: CL.HIGH,
            industry: CL.HIGH,
            territory: CL.HIGH,
            cargoPriceMultipliers: NewsEffect.getInvertedCargoPriceMultipliers(this.startEffects[0].cargoPriceMultipliers),
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                cargoPriceMultipliers: NewsEffect.getInvertedCargoPriceMultipliers(this.startEffects[0].cargoPriceMultipliers),
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        //better navy and economy (logistics) helps
        this.rollOutcome((planet.c.navy*planet.c.economy), CL.SLIGHTLY_LOW)
    }

    isValid() {
        const {planet: p} = this
        const ratingsValid = planet.c.population > CL.MEDIUM && (planet.c.navy > CL.MEDIUM)
        //basically dont do it if ANYTHING bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NT.COLONIZATION, ...NT_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
