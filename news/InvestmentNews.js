class InvestmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)}'s investors send a massive investment to ${coloredName(targetPlanet)} in order to boost their economy!`,
            `${coloredName(planet)}'s investment in ${coloredName(targetPlanet)} produces great yields for either side!`,
            `${coloredName(planet)}'s investment in ${coloredName(targetPlanet)} collapses due to fraud and mismanagement! Both sides lose out!`,
            `Tensions force ${coloredName(planet)} to pull investment from ${coloredName(targetPlanet)}!`,
            NT.INVESTMENT, planet, targetPlanet
        )

        const buildingsImproved = rndMembers(targetPlanet.settlement.improvableBuildings, rng(3,1), true);

        this.addPlanetEffect(
            {
                wealth: CL.LOW,
                reserves: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                wealth: CL.HIGH,
                reserves: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                wealth: CL.LOW,
                reserves: CL.HIGH
            },
        )

        this.addTargetPlanetEffect(
            {
                wealth: CL.HIGH,
                reserves: CL.LOW,
                industry: CL.SLIGHTLY_HIGH,
                econommy: CL.SLIGHTLY_HIGH
            },
            {
                buildingsImproved,
                wealth: CL.HIGH,
                reserves: CL.LOW,
                industry: CL.VERY_HIGH,
                econommy: CL.HIGH,
                taxes: CL.LOW
            },
            {
                corruption: CL.HIGH
            },
        )
    }

    shouldCancel() {
        return Civilization.areTenseOrAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome((this.targetPlanet.c.economy/this.targetPlanet.c.corruption/this.targetPlanet.c.crime) / 2)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //need to have sufficient economy of our own
        const ratingsValid = p.c.wealth > CL.SLIGHTLY_HIGH && tp.c.industry < CL.MEDIUM
        //our economy should be larger than theirs
        const transferValid = p.c.economy > tp.c.economy && p.c.wealth > tp.c.wealth
        //both planets must be neutral or allies
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        //removed most of the requirements for this, can we not have like a marshall plan??
        const interferingEvent = News.planetHasAnyNews(tp, NT_ECONOMY_PREVENTING) || News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        return transferValid && ratingsValid && relationshipsValid && !interferingEvent
    }
}
