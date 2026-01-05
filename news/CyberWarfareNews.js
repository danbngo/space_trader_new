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
                wealth: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.HOLOCUBES, CL.HIGH]])),
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
        const {planet: p, targetPlanet: tp} = this
        // Can resist with strong education or culture
        const aggressorScore = p.c.technology * p.objectType.powerMultiplier
        const victimScore = (tp.c.education * tp.c.culture * tp.c.technology) * tp.objectType.powerMultiplier
        this.rollOutcome(aggressorScore / victimScore, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // More likely if attacker has high technology
        const ratingsValid = p.c.technology > CL.HIGH
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        return ratingsValid && relationshipsValid
    }
}
