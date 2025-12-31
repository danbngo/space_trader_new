class TradeAgreementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} and ${coloredName(targetPlanet)} sign an expansive trade agreement, benefitting both planets!`,
            `${coloredName(planet)} and ${coloredName(targetPlanet)}'s trade agreement has lapsed!`,
            `Trade negotiations between ${coloredName(planet)} and ${coloredName(targetPlanet)} collapse due to economic instability!`,
            `Rising tensions force ${coloredName(planet)} and ${coloredName(targetPlanet)} to suspend trade agreement!`,
            NT.TRADE_AGREEMENT, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                reserves: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.HIGH
            },
            {
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            },
            {
                economy: CL.LOW,
                wealth: CL.LOW
            },
            {
                reserves: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            }
        )

        this.addTargetPlanetEffect(
            {
                reserves: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.HIGH
            },
            {
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            },
            {
                economy: CL.LOW,
                wealth: CL.LOW
            },
            {
                reserves: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            }
        )
    }

    shouldCancel() {
        return Civilization.areTenseOrAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check for economic collapse
        const economyCheck = (p.c.economy < CL.LOW) || (tp.c.economy < CL.LOW)
        if (economyCheck) {
            this.failed = true
        }
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //planets must be neutral or allied towards each other
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        //dont trade with opposing governments
        const govTypesValid = !Civilization.areOpposingGovernments(p, tp)
        //trade is only blocked if you're actively hostile to each other. 
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.TRADE_AGREEMENT, ...NT_COOPERATION_PREVENTING])
        return govTypesValid && relationshipsValid && !interferingEvent
    }
}
