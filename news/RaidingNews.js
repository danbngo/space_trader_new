class RaidingNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends raiding parties to take riches and goods from ${coloredName(targetPlanet)}! Plundered goods flood their markets!`,
            `${coloredName(planet)} ceases its raiding operations against ${coloredName(targetPlanet)}, having satiated its hunger for riches!`,
            `${coloredName(targetPlanet)} repels ${coloredName(planet)}'s raiders, inflicting heavy losses!`,
            `Peace treaty sees ${coloredName(planet)} end its raids on ${coloredName(targetPlanet)}!`,
            NT.RAIDING, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                reserves: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                territory: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW
            },
            {
                reserves: CL.HIGH,
                wealth: CL.HIGH,
                territory: CL.HIGH,
                prestige: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.VERY_LOW,
                navy: CL.SLIGHTLY_LOW,
                army: CL.LOW
            },
            {
                prestige: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                reserves: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW
            },
            {
                reserves: CL.LOW,
                wealth: CL.LOW,
                security: CL.LOW,
                economy: CL.LOW,
                prestige: CL.LOW,
                army: CL.LOW
            },
            {
                prestige: CL.HIGH,
                military: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH,
            },
        )
    }

    shouldCancel() {
        return Civilization.areAlliesOrNeutral(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome((this.planet.c.military/this.targetPlanet.c.military), CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // More likely if military is high and goods are low
        const ratingsValid = p.c.army > 1.25 && (p.c.reserves/MARKET_AVERAGE_CARGO_PER_TYPE < 0.5 || p.c.crime < 0.5)
        const relationshipsValid = Civilization.areAtWar(p, tp)
        return ratingsValid && relationshipsValid
    }
}
