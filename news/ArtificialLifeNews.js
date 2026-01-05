class ArtificialLifeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} pushes the boundaries of science by creating bespoke artificial life forms to serve as pets, workers, and companions!`,
            `${coloredName(planet)}'s artificial life program thrives despite ethical concerns, boosting industry and technology!`,
            `${coloredName(planet)} shuts down controversial artificial life program amid protests and ethical violations!`,
            '',
            NT.ARTIFICIAL_LIFE, planet
        )

        this.addPlanetEffect(
            {
                technology: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
            },
            {
                wealth: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_LOW,
            },
            {
                taxes: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
            }
        )
    }

    determineOutcome() {
        // Success based on technology and education
        this.rollOutcome(this.planet.c.technology * this.planet.c.education, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // More likely in high-tech societies with strong research base
        const ratingsValid = p.c.technology > CL.HIGH && p.c.education > CL.SLIGHTLY_HIGH
        return ratingsValid
    }
}
