class ForeignAidNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} sends foreign aid to help struggling ${coloredName(planet)}!`,
            `${coloredName(targetPlanet)}'s foreign aid program to ${coloredName(planet)} helps strengthen their economy!`,
            `${coloredName(planet)} squanders majority of foreign aid from ${coloredName(targetPlanet)} due to corruption and mismanagement!`,
            ``,
            NT.FOREIGN_AID, planet, targetPlanet
        )

        const buildingsImproved = rndMembers(planet.settlement.improvableBuildings, rng(3,1), true);

        this.addPlanetEffect(
            {
                reserves: CL.HIGH,
                wealth: CL.HIGH,
                prestige: CL.SLIGHTLY_LOW,
            },
            {
                buildingsImproved,
                reserves: CL.HIGH,
                wealth: CL.HIGH,
                economy: CL.HIGH,
                industry: CL.HIGH,
                education: CL.HIGH,
                prestige: CL.SLIGHTLY_LOW,
            },
            {
                reserves: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                prestige: CL.LOW,
            }
        )

        this.addTargetPlanetEffect(
            {
                reserves: CL.LOW,
                wealth: CL.LOW,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                reserves: CL.LOW,
                wealth: CL.LOW,
                prestige: CL.HIGH,
            },
            {
                reserves: CL.LOW,
                wealth: CL.LOW,
                prestige: CL.SLIGHTLY_HIGH,
            }
        )
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.education/this.planet.c.corruption, CL.VERY_LOW)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //recipient must have poor economy
        const economyValid = p.c.economy < CL.LOW && p.c.industry < CL.LOW && p.c.wealth < CL.LOW
        //recipient can't be hated
        //const prestigeValid = p.c.prestige > CL.LOW - if we're neutral thats fine already
        //donor must have more wealth/reserves/economy than recipient
        const donorValid = tp.c.reserves > p.c.reserves && tp.c.wealth > p.c.wealth && tp.c.economy > p.c.economy
        //donor must have enough to spare
        const donorCapable = tp.c.reserves > CL.MEDIUM && tp.c.wealth > CL.MEDIUM
        //planets must be neutral or allied
        const relationshipValid = Civilization.areAlliesOrNeutral(p, tp)
        const interferingEvent = News.planetHasAnyNews(p, NT_ECONOMY_BOOSTING) || News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        return economyValid && donorValid && donorCapable && relationshipValid && !interferingEvent
    }
}
