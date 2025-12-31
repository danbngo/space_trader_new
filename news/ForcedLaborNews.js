class ForcedLaborNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} implements brutal forced labor programs! Citizens are pressed into industrial work camps!`,
            `${coloredName(planet)}'s forced labor camps are finally dismantled!`,
            `Slave revolts force ${coloredName(planet)} to shut down labor camps!`,
            ``,
            NT.FORCED_LABOR, planet
        )

        this.addPlanetEffect(
            {
                industry: CL.VERY_HIGH,
                population: CL.LOW,
                prestige: CL.LOW,
            },
            {
                industry: CL.SLIGHTLY_HIGH,
                prestige: CL.LOW,
            },
            {
                population: CL.VERY_LOW,
                prestige: CL.VERY_LOW,
                crime: CL.VERY_HIGH,
            }
        )
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.security)
    }

    isValid() {
        const {planet: p} = this
        // More likely if industry is low (trying to industrialize)
        const ratingsValid = p.c.industry < CL.LOW
        return ratingsValid
    }
}
