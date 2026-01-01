class ForcedLaborNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} implements brutal forced labor programs! Citizens are pressed into industrial work camps!`,
            `${coloredName(planet)}'s forced labor policies produce staggering economic gains despite their human cost!`,
            `Worker revolts force ${coloredName(planet)} to shut down their forced labor program!`,
            ``,
            NT.FORCED_LABOR, planet
        )

        this.addPlanetEffect(
            {
                industry: CL.HIGH,
                population: CL.SLIGHTLY_LOW,
                prestige: CL.LOW,
                education: CL.SLIGHTLY_LOW,
                culture: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.NANITES, CL.LOW], [CARGO_TYPES.METAL, CL.HIGH]])),
            },
            {
                industry: CL.VERY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                population: CL.SLIGHTLY_LOW,
                prestige: CL.LOW,
                education: CL.SLIGHTLY_LOW,
                reserves: CL.VERY_HIGH,
                taxes: CL.LOW,
                culture: CL.LOW
            },
            {
                prestige: CL.LOW,
                education: CL.SLIGHTLY_LOW,
                reserves: CL.VERY_HIGH,
                taxes: CL.LOW,
                culture: CL.LOW
            }
        )
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.security*this.planet.c.army*this.planet.c.corruption/this.planet.c.education/this.planet.c.culture)
    }

    isValid() {
        const {planet: p} = this
        // More likely if industry is low (trying to industrialize)
        const ratingsValid = (p.c.industry < CL.SLIGHTLY_LOW) && (p.c.corruption > CL.MEDIUM)
        return ratingsValid
    }
}
