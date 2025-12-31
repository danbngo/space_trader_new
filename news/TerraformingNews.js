class TerraformingNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} sends its best engineers and terraformers to terraform its moon!`,
            `${coloredName(planet)}'s moon terraforming project is complete, yielding new territory and industry!`,
            `${coloredName(planet)}'s terraforming project fails catastrophically! Resources squandered!`,
            '',
            NT.TERRAFORMING, planet
        )

        this.addPlanetEffect(
            {
                education: CL.LOW,
                wealth: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.METAL, CL.VERY_HIGH],
                    [CARGO_TYPES.NANITES, CL.VERY_HIGH]
                ]))
            },
            {
                education: CL.NO_REGRESSION,
                territory: CL.SLIGHTLY_HIGH
            },
            {
                education: CL.NO_REGRESSION,
                wealth: CL.NO_REGRESSION,
                prestige: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.METAL, CL.NO_REGRESSION],
                    [CARGO_TYPES.NANITES, CL.NO_REGRESSION]
                ]))
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher industry and education = more likely to succeed
        this.rollOutcome((p.c.industry + p.c.education) / 2)
    }

    isValid() {
        const {planet: p} = this
        // Need sufficient ships, officers, and credits to undertake terraforming
        const ratingsValid = p.c.navy > CL.MEDIUM && 
                            p.c.army > CL.MEDIUM && 
                            p.c.wealth > CL.MEDIUM
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NT.TERRAFORMING, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
