class SportsEventNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is hosting the Interplanetary Games, a massive spectacle drawing athletes and spectators from across the system!`,
            `${coloredName(planet)} successfully manages the Games, securing their reputation as a world-class host!`,
            `${coloredName(planet)}'s Games are marred by logistical failures and security issues!`,
            '',
            NT.SPORTS_EVENT, planet
        )

        this.addPlanetEffect(
            {
                wealth: CL.HIGH,
                taxes: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_HIGH,
            },
            {
                wealth: CL.HIGH,
                taxes: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                wealth: CL.SLIGHTLY_HIGH,
                prestige: CL.LOW,
                economy: CL.LOW,
            }
        )
    }

    determineOutcome() {
        // Success based on economy, security, and infrastructure
        this.rollOutcome(this.planet.c.economy * this.planet.c.security * this.planet.c.industry, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // More likely in wealthy, stable planets with good infrastructure
        const ratingsValid = p.c.wealth > CL.MEDIUM && p.c.economy > CL.SLIGHTLY_HIGH && p.c.security > CL.SLIGHTLY_LOW
        return ratingsValid
    }
}
