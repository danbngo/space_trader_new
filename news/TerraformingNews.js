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
                guildNumOfficers: CL.LOW,
                officerQuality: CL.LOW,
                credits: CL.LOW,
                shipyardNumShips: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, CL.VERY_HIGH], [CARGO_TYPES.NANITES, CL.VERY_HIGH]]),
            })
        ]
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Ships and officers stay deployed, territory and industry gains are permanent
        Object.assign(this.completeEffects[0], {
            shipyardNumShips: CL.NO_REGRESSION, // ships stay stationed there
            guildNumOfficers: CL.NO_REGRESSION, // officers stay stationed there
            officerQuality: CL.NO_REGRESSION, // officers maintain quality
            industry: CL.SLIGHTLY_HIGH, // permanent industry boost
            economy: CL.SLIGHTLY_HIGH, // permanent economy boost
            territory: CL.SLIGHTLY_HIGH, // permanent territory gain
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                shipyardNumShips: CL.NO_REGRESSION,
                guildNumOfficers: CL.NO_REGRESSION,
                officerQuality: CL.NO_REGRESSION,
                credits: CL.NO_REGRESSION,
                prestige: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, CL.NO_REGRESSION], [CARGO_TYPES.NANITES, CL.NO_REGRESSION]]),
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Higher industry and officer quality = more likely to succeed
        const successProbability = (planet.culture.industry + planet.culture.officerQuality) / 2
        this.failed = Math.random() > successProbability
    }

    isValid() {
        const {planet} = this
        // Need sufficient ships, officers, and credits to undertake terraforming
        const ratingsValid = planet.navy > CL.MEDIUM && 
                            planet.army > CL.MEDIUM && 
                            planet.settlement.wealth > CL.MEDIUM
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NT.TERRAFORMING, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
