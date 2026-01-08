class BankruptcyNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} teeters on the brink of default, drowning in unpayable debts! They appeal to ${coloredName(targetPlanet)} for a bailout!`,
            `${coloredName(targetPlanet)} grants ${coloredName(planet)} a bailout, stabilizing their economy at the cost of sovereignty!`,
            `${coloredName(targetPlanet)} refuses to bail out ${coloredName(planet)}! It's forced to declare bankruptcy and default on all loans!`,
            '',
            NT.BANKRUPTCY, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                wealth: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                taxes: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH],
                    [CARGO_TYPES.WATER, CL.SLIGHTLY_HIGH],
                    [CARGO_TYPES.MEDICINE, CL.HIGH]
                ]))
            },
            {
                wealth: CL.HIGH,
                economy: CL.HIGH,
                reserves: CL.HIGH,
                taxes: CL.LOW,
                prestige: CL.LOW,
            },
            {
                wealth: CL.HIGH,
                economy: CL.HIGH,
                reserves: CL.HIGH,
                taxes: CL.LOW,
                prestige: CL.EXTREMELY_LOW,
            }
        )

        this.addTargetPlanetEffect(
            {},
            {
                prestige: CL.SLIGHTLY_HIGH,
                wealth: CL.LOW,
            },
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success based on prestige and economy
        // it seems ludicrously easy for powerful entities to get bailouts, so...
        this.rollOutcome((p.c.prestige + p.c.economy + p.c.industry)/3, CL.LOW)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // More likely with very low wealth or economy
        const ratingsValid = p.c.wealth < CL.VERY_LOW || p.c.economy > CL.VERY_HIGH
        const relationshipsValid = Civilization.areAlliesOrNeutral(tp, p)
        const interferingEvent = News.planetHasAnyNews(p, NT_GOVERNANCE_PREVENTING) || News.planetHasAnyNewsTargeting(p, NT_GOVERNANCE_PREVENTING)
        || News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING) 
        return relationshipsValid &&ratingsValid && !interferingEvent
    }
}
