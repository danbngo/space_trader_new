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
                civilizationMultipliers: new Civilization({
                    population: CL.LOW,
                    inflation: CL.HIGH,
                    navy: CL.VERY_LOW, // ships sent to colonize
                    reserves: CL.LOW,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.METAL, CL.VERY_HIGH], [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_HIGH]])),
                    wealth: CL.LOW, // funding colonization
                    taxes: CL.HIGH
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            economy: CL.HIGH,
            industry: CL.HIGH,
            territory: CL.HIGH,
            population: CL.NO_REGRESSION,
            navy: CL.LOW,
            wealth: CL.LOW,
            taxes: CL.HIGH,
            prestige: CL.HIGH
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.NO_REGRESSION,
            navy: CL.NO_REGRESSION,
            wealth: CL.NO_REGRESSION,
            prestige: CL.SLIGHTLY_LOW,
            taxes: CL.SLIGHTLY_HIGH,
        }))
   }

    determineOutcome() {
        const {planet: p} = this
        //better navy and economy (logistics) helps
        this.rollOutcome((p.c.navy*p.c.economy), CL.SLIGHTLY_LOW)
    }

    isValid() {
        const {planet: p} = this
        const ratingsValid = p.c.population > CL.MEDIUM && (p.c.navy > CL.MEDIUM)
        //basically dont do it if ANYTHING bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(p, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
