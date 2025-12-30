class TerraformingNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} sends its best engineers and terraformers to terraform its moon!`,
            `${coloredName(planet)}'s moon terraforming project is complete, yielding new territory and industry!`,
            `${coloredName(planet)}'s terraforming project fails catastrophically! Resources squandered!`,
            '',
            NT.TERRAFORMING, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                education: CL.LOW,
                wealth: CL.LOW,
                navy: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.METAL, CL.VERY_HIGH], [CARGO_TYPES.NANITES, CL.VERY_HIGH]])),
            })
        ]
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Ships and officers stay deployed, territory and industry gains are permanent
        Object.assign(this.completeEffects[0], {
            navy: CL.NO_REGRESSION, // ships stay stationed there
            education: CL.NO_REGRESSION, // officers maintain quality
            industry: CL.SLIGHTLY_HIGH, // permanent industry boost
            economy: CL.SLIGHTLY_HIGH, // permanent economy boost
            territory: CL.SLIGHTLY_HIGH, // permanent territory gain
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                navy: CL.NO_REGRESSION,
                education: CL.NO_REGRESSION,
                wealth: CL.NO_REGRESSION,
                prestige: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.METAL, CL.NO_REGRESSION], [CARGO_TYPES.NANITES, CL.NO_REGRESSION]])),
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher industry and officer quality = more likely to succeed
        const successProbability = (planet.c.industry + planet.c.education) / 2
        this.failed = Math.random() > successProbability
    }

    isValid() {
        const {planet: p} = this
        // Need sufficient ships, officers, and credits to undertake terraforming
        const ratingsValid = planet.c.navy > CL.MEDIUM && 
                            planet.c.army > CL.MEDIUM && 
                            planet.c.wealth > CL.MEDIUM
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NT.TERRAFORMING, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
