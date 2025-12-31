class InvestmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends a massive economic investment to ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s economic investment in ${coloredName(targetPlanet)} is complete!`,
            `${coloredName(planet)}'s investment in ${coloredName(targetPlanet)} collapses due to mismanagement!`,
            `Tensions force ${coloredName(planet)} to pull investment from ${coloredName(targetPlanet)}!`,
            NT.INVESTMENT, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                targetPlanet: this.targetPlanet,
                wealth: CL.LOW,
                reserves: CL.VERY_LOW,
            },
            {
                wealth: News.clHalfRegression(CL.LOW),
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                wealth: CL.NO_REGRESSION,
                prestige: CL.LOW,
            },
            {
                wealth: News.clHalfRegression(CL.LOW),
                prestige: News.clHalfRegression(CL.SLIGHTLY_HIGH),
            }
        )

        this.addTargetPlanetEffect(
            {
                reserves: CL.VERY_HIGH,
                wealth: CL.HIGH,
            },
            {
                industry: CL.VERY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
            },
            {
                industry: News.clHalfRegression(CL.VERY_HIGH),
            },
            {
                reserves: News.clHalfRegression(CL.VERY_HIGH),
                wealth: News.clHalfRegression(CL.HIGH),
                industry: News.clHalfRegression(CL.VERY_HIGH),
                economy: News.clHalfRegression(CL.SLIGHTLY_HIGH),
            }
        )
    }

    shouldCancel() {
        return Civilization.areTenseOrAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        this.rollOutcome((tp.c.economy + tp.c.security) / 2)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //need to have sufficient economy of our own
        const ratingsValid = p.c.wealth >= CL.SLIGHTLY_HIGH || p.c.reserves/MARKET_AVERAGE_CARGO_PER_TYPE > CL.SLIGHTLY_HIGH
        //our economy should be larger than theirs
        const transferValid = p.c.economy > tp.c.economy && p.c.wealth > tp.c.wealth && p.c.reserves > tp.c.reserves
        //both planets must be neutral or allies
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        //removed most of the requirements for this, can we not have like a marshall plan??
        const interferingEvent = 
            News.hasNews(NT.INVESTMENT, p, tp)
        return transferValid && ratingsValid && relationshipsValid && !interferingEvent
    }
}
