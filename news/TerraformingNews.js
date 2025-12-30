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
                civilizationMultipliers: new Civilization({
                    education: CL.LOW,
                    wealth: CL.LOW,
                    military: CL.SLIGHTLY_LOW
                }),
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.METAL, CL.VERY_HIGH],
                    [CARGO_TYPES.NANITES, CL.VERY_HIGH]
                ]))
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Ships and officers stay deployed, territory and industry gains are permanent
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            military: CL.NO_REGRESSION,  // Ships stay stationed there
            education: CL.NO_REGRESSION,  // Officers maintain quality
            industry: CL.SLIGHTLY_HIGH,  // Permanent industry boost
            economy: CL.SLIGHTLY_HIGH,  // Permanent economy boost
            territory: CL.SLIGHTLY_HIGH  // Permanent territory gain
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            military: CL.NO_REGRESSION,
            education: CL.NO_REGRESSION,
            wealth: CL.NO_REGRESSION,
            prestige: CL.LOW
        }))
        this.failEffects[0].cargoPriceMultipliers = new CountsMap(new Map([
            [CARGO_TYPES.METAL, CL.NO_REGRESSION],
            [CARGO_TYPES.NANITES, CL.NO_REGRESSION]
        ]))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
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
