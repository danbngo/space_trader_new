class TerraformingNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} sends its best engineers and terraformers to terraform its moon!`,
            `${coloredName(planet)}'s moon terraforming project is complete, yielding new territory and industry!`,
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
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Ships and officers stay deployed, territory and industry gains are permanent
        Object.assign(this.endEffects[0], {
            shipyardNumShips: CL.NO_REGRESSION, // ships stay stationed there
            guildNumOfficers: CL.NO_REGRESSION, // officers stay stationed there
            officerQuality: CL.NO_REGRESSION, // officers maintain quality
            industry: CL.SLIGHTLY_HIGH, // permanent industry boost
            economy: CL.SLIGHTLY_HIGH, // permanent economy boost
            territory: CL.SLIGHTLY_HIGH, // permanent territory gain
        })
    }

    isValid() {
        const {planet} = this
        // Need sufficient ships, officers, and credits to undertake terraforming
        const ratingsValid = planet.settlement.shipyard.baseNumShips > CL.MEDIUM && 
                            planet.settlement.guild.baseNumOfficers > CL.MEDIUM && 
                            planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS > CL.MEDIUM
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NT.TERRAFORMING, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
