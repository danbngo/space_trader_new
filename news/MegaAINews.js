class MegaAINews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins construction of a superintelligent AI to manage their entire society!`,
            `${coloredName(planet)}'s mega AI goes online and immediately begins optimizing all aspects of society with incredible efficiency!`,
            `${coloredName(planet)}'s mega AI goes rogue! Military forces mobilize to contain and destroy the rampaging intelligence before it can cause more damage!`,
            ``,
            NT.MEGA_AI, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.HIGH,
                wealth: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.VERY_HIGH],
                    [CARGO_TYPES.ISOTOPES, CL.HIGH]
                ]))
            },
            {
                // Success: AI optimizes everything
                technology: CL.VERY_HIGH,
                economy: CL.HIGH,
                industry: CL.HIGH,
                education: CL.SLIGHTLY_HIGH,
                security: CL.HIGH,
                taxes: CL.SLIGHTLY_HIGH,
                reserves: CL.SLIGHTLY_HIGH,
                corruption: CL.LOW,
                crime: CL.LOW,
                prestige: CL.HIGH
            },
            {
                // Failure: Rogue AI causes massive damage
                technology: CL.VERY_LOW,
                education: CL.LOW,
                army: CL.VERY_LOW,
                security: CL.VERY_LOW,
                wealth: CL.LOW,
                industry: CL.LOW,
                economy: CL.LOW,
                population: CL.SLIGHTLY_LOW,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on tech, education, and security measures
        // Higher corruption increases chance of failure (bribes, corners cut)
        this.rollOutcome(p.c.technology * p.c.education * p.c.security / (p.c.corruption * p.c.corruption), CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires extremely high tech and education
        const ratingsValid = p.c.technology > CL.SLIGHTLY_HIGH 
            && p.c.education > CL.SLIGHTLY_HIGH
            && p.c.wealth > CL.MEDIUM
        const interferingEvent = News.planetHasAnyNewsTargeting(p, NT_ECONOMY_PREVENTING) || News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
