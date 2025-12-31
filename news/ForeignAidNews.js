class ForeignAidNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} sends foreign aid to help struggling ${coloredName(planet)}!`,
            `${coloredName(targetPlanet)}'s foreign aid program to ${coloredName(planet)} finally ends!`,
            `${coloredName(planet)} squanders foreign aid from ${coloredName(targetPlanet)} on corruption and mismanagement!`,
            ``,
            NT.FOREIGN_AID, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                planet: this.planet,
                reserves: CL.HIGH,
                wealth: CL.HIGH,
                prestige: CL.SLIGHTLY_LOW,
            },
            {
                reserves: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW,
            },
            {
                prestige: CL.VERY_LOW,
                corruption: CL.HIGH,
            }
        )

        this.addTargetPlanetEffect(
            {
                reserves: CL.LOW,
                taxes: CL.HIGH,
                wealth: CL.LOW,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                reserves: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                reserves: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_HIGH,
            }
        )
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.security)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //recipient must have poor economy
        const economyValid = p.c.economy < CL.LOW && p.c.industry < CL.LOW && p.c.wealth < CL.LOW
        const prestigeValid = p.c.prestige > CL.LOW
        //donor must have more wealth/reserves/economy than recipient
        const donorValid = tp.c.reserves > p.c.reserves && tp.c.wealth > p.c.wealth && tp.c.economy > p.c.economy
        //donor must have enough to spare
        const donorCapable = tp.c.reserves > CL.HIGH && tp.c.wealth > CL.HIGH
        //planets must be neutral or allied
        const relationshipValid = Civilization.areAlliesOrNeutral(p, tp)
        const interferingEvent = News.planetHasAnyNews(p, NT_ECONOMY_BOOSTING) || News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        return economyValid && prestigeValid && donorValid && donorCapable && relationshipValid && !interferingEvent
    }
}
