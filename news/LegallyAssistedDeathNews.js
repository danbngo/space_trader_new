class LegallyAssistedDeathNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} sparks fierce debate by proposing legalized assisted death for those seeking a dignified end!`,
            `${coloredName(planet)} successfully implements assisted death laws while maintaining social harmony!`,
            `${coloredName(planet)} abandons assisted death policy after massive public outcry and protests!`,
            '',
            NT.LEGALLY_ASSISTED_DEATH, planet
        )

        this.addPlanetEffect(
            {
                culture: CL.SLIGHTLY_LOW,
            },
            {
                population: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH,
                taxes: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_HIGH,
            },
            {
                culture: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
            }
        )
    }

    determineOutcome() {
        // Success based on culture and education
        this.rollOutcome(this.planet.c.culture * this.planet.c.education, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // More likely in educated, cultured societies
        const ratingsValid = p.c.culture > CL.SLIGHTLY_HIGH && p.c.education > CL.SLIGHTLY_HIGH
        return ratingsValid
    }
}
