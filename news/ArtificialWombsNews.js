class ArtificialWombsNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} unveils a controversial artificial womb program to rapidly boost population through synthetic gestation!`,
            `${coloredName(planet)}'s artificial womb program succeeds, integrating new citizens smoothly into society!`,
            `${coloredName(planet)}'s artificial womb program causes social disruption as the new generation struggles to fit in!`,
            '',
            NT.ARTIFICIAL_WOMBS, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.HIGH,
                wealth: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.MEDICINE, CL.HIGH],
                    [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                population: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
            },
            {
                population: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
            }
        )
    }

    determineOutcome() {
        // Success based on technology, education, and culture
        this.rollOutcome(this.planet.c.technology * this.planet.c.education * this.planet.c.culture, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // More likely when population is low and technology is high
        const ratingsValid = p.c.population < CL.MEDIUM && p.c.technology > CL.SLIGHTLY_HIGH && p.c.wealth > CL.SLIGHTLY_LOW
        return ratingsValid
    }
}
