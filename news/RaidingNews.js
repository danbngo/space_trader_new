class RaidingNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches raids on ${coloredName(targetPlanet)}! Plundered goods flood their markets!`,
            `${coloredName(planet)} ceases its raiding operations against ${coloredName(targetPlanet)}!`,
            `${coloredName(targetPlanet)} repels ${coloredName(planet)}'s raiders, inflicting heavy losses!`,
            `Peace treaty forces ${coloredName(planet)} to end raids on ${coloredName(targetPlanet)}!`,
            NT.RAIDING, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                reserves: CL.VERY_HIGH,
                territory: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW
            },
            {
                territory: CL.NO_REGRESSION,
                reserves: CL.NO_REGRESSION,
            },
            {
                prestige: CL.VERY_LOW,
            },
            {
                reserves: CL.SLIGHTLY_HIGH,
                territory: CL.SLIGHTLY_HIGH
            }
        )

        this.addTargetPlanetEffect(
            {
                reserves: CL.LOW,
                wealth: CL.LOW,
                security: CL.LOW,
                economy: CL.LOW,
                prestige: CL.LOW
            },
            {
                reserves: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                prestige: CL.NO_REGRESSION,
                wealth: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.HIGH,
                military: CL.SLIGHTLY_LOW
            },
            {
                reserves: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW
            }
        )
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if peace declared
        const rel = p.c.relationships.get(tp)
        return rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Raids succeed unless target has strong defense
        const successProbability = 1 - (tp.c.army / p.c.army) * 0.3
        this.rollOutcome(successProbability)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // More likely if military is high and goods are low
        const ratingsValid = p.c.army > 1.25 && (p.c.reserves/MARKET_AVERAGE_CARGO_PER_TYPE < 0.5 || p.c.crime < 0.5)
        const relationshipsValid = Civilization.areAtWar(p, tp)
        return ratingsValid && relationshipsValid
    }
}
