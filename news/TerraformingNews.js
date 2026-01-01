class TerraformingNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} undertakes a terraforming project to improve their planet's habitability!`,
            `${coloredName(planet)}'s terraforming project is complete, yielding new territory and industry!`,
            `${coloredName(planet)}'s terraforming project fails catastrophically! Resources squandered!`,
            '',
            NT.TERRAFORMING, planet
        )

        this.addPlanetEffect(
            {
                wealth: CL.LOW,
                taxes: CL.VERY_HIGH,
                reserves: CL.LOW,
                education: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.NANITES, CL.VERY_HIGH], [CARGO_TYPES.ISOTOPES, CL.VERY_HIGH],]))
            },
            {
                wealth: CL.LOW,
                taxes: CL.HIGH,
                reserves: CL.LOW,
                education: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH, //we're pushing the edge of technology
                industry: CL.HIGH,
                territory: CL.SLIGHTLY_HIGH,
                economy: CL.HIGH,
                prestige: CL.HIGH
            },
            {
                wealth: CL.LOW,
                taxes: CL.HIGH,
                reserves: CL.LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher industry and education = more likely to succeed
        // this should be a tough project
        this.rollOutcome(p.c.education*p.c.technology*p.c.industry/p.c.corruption/p.c.territory, CL.HIGH)
    }

    isValid() {
        const {planet: p} = this
        const ratingsValid = (p.c.education > CL.SLIGHTLY_HIGH || p.c.technology > CL.SLIGHTLY_HIGH) && p.c.taxes > CL.SLIGHTLY_LOW
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
