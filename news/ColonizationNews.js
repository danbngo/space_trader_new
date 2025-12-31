class ColonizationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins building a fleet to colonize resource-rich asteroids in the central belt!`,
            `${coloredName(planet)}'s colony ships have finished building settlements on resource laden asteroids!`,
            `${coloredName(planet)}'s colonization effort fails! Pirates raid their ships and hazards, scarcity and disease afflict their colonies!`,
            '',
            NT.COLONIZATION, planet
        )

        this.addEffect(
            {
                planet: this.planet,
                navy: CL.VERY_LOW,
                population: CL.LOW,
                reserves: CL.LOW,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.METAL, CL.VERY_HIGH], [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_HIGH]])),
            },
            {
                navy: CL.LOW,
                population: CL.LOW,
                wealth: CL.HIGH,
                taxes: CL.SLIGHTLY_HIGH,
                prestige: CL.HIGH,
                economy: CL.HIGH,
                industry: CL.HIGH,
                territory: CL.HIGH,
            },
            {
                navy: CL.VERY_LOW,
                population: CL.LOW,
                reserves: CL.LOW,
                taxes: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW,
            }
        )
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
