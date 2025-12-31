class CyberWarfareNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches devastating cyber attacks against ${coloredName(targetPlanet)}, crippling their digital infrastructure and eroding their cultural institutions!`,
            `${coloredName(planet)} cyber warfare is successful, sowing chaos and ignorance amid the population of ${coloredName(targetPlanet)}!`,
            `${coloredName(targetPlanet)}'s robust institutions hold firm against ${coloredName(planet)}'s cyber attacks!`,
            `Tensions ease between ${coloredName(planet)} and ${coloredName(targetPlanet)}, ending the cyber warfare campaign!`,
            NT.CYBER_WARFARE, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                prestige: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.LOW,
                wealth: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                technology: CL.SLIGHTLY_LOW,
                education: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW,
            },
            {
                technology: CL.LOW,
                education: CL.VERY_LOW,
                culture: CL.LOW,
                security: CL.LOW,
                prestige: CL.SLIGHTLY_LOW
            },
            {
                culture: CL.SLIGHTLY_HIGH,
                corruption: CL.SLIGHTLY_LOW
            }
        )
    }

    shouldCancel() {
        return Civilization.areAlliesOrNeutral(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        // Can resist with strong education or culture
        this.rollOutcome((this.planet.c.technology / this.targetPlanet.c.education / this.targetPlanet.c.culture / this.targetPlanet.c.technology), CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // More likely if attacker has high technology
        const ratingsValid = p.c.technology > CL.HIGH
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        return ratingsValid && relationshipsValid
    }
}
