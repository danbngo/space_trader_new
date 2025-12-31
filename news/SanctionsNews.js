class SanctionsNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} imposes economic sanctions on ${coloredName(targetPlanet)}, damaging both economies!`,
            `${coloredName(planet)}'s sanctions succeed in disrupting ${coloredName(targetPlanet)}'s economy!`,
            `${coloredName(planet)}'s sanctions on ${coloredName(targetPlanet)} backfire, causing more domestic harm!`,
            `${coloredName(planet)} ends sanctions on ${coloredName(targetPlanet)} as relations normalize!`,
            NT.SANCTIONS, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                reserves: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW
            },
            {
                reserves: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                reserves: CL.LOW,
                economy: CL.LOW,
                wealth: CL.LOW,
                prestige: CL.SLIGHTLY_LOW
            },
        )

        this.addTargetPlanetEffect(
            {
                reserves: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW
            },
            {
                reserves: CL.LOW,
                economy: CL.LOW,
                wealth: CL.LOW,
                prestige: CL.LOW
            },
            {
                reserves: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,
            },
        )
    }

    shouldCancel() {
        return Civilization.areAlliesOrNeutral(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.economy*this.planet.c.wealth*this.planet.c.prestige
            /this.targetPlanet.c.economy/this.targetPlanet.c.economy/this.targetPlanet.c.prestige)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //we need a strong economy and prestige to pull it off
        const ratingsValid = p.c.economy > CL.SLIGHTLY_HIGH && p.c.wealth > CL.SLIGHTLY_HIGH && p.c.prestige > CL.MEDIUM
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        //blocked if already at war or other hostile actions
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATIVE)
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
