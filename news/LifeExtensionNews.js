class LifeExtensionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} announces a breakthrough in life extension technology, promising to extend lifespans dramatically!`,
            `${coloredName(planet)}'s life extension technology proves successful! The population celebrates as lifespans increase and quality of life improves!`,
            `${coloredName(planet)}'s life extension technology has catastrophic side effects! Recipients suffer unexpected complications and societal chaos ensues!`,
            ``,
            NT.LIFE_EXTENSION, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.MEDICINE, CL.ASTRONOMICAL],
                    [CARGO_TYPES.ISOTOPES, CL.VERY_HIGH]
                ]))
            },
            {
                population: CL.HIGH,
                education: CL.HIGH,
                culture: CL.HIGH,
                economy: CL.HIGH,
                wealth: CL.HIGH,
                prestige: CL.VERY_HIGH,
                taxes: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.LOW,
                education: CL.LOW,
                culture: CL.LOW,
                economy: CL.LOW,
                wealth: CL.LOW,
                prestige: CL.LOW,
                taxes: CL.VERY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on technology, education, and medical infrastructure
        this.rollOutcome(p.c.technology * p.c.education * p.c.wealth / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires very high tech and good medical infrastructure
        const ratingsValid = p.c.technology > CL.VERY_HIGH 
            && p.c.education > CL.HIGH
            && p.c.wealth > CL.SLIGHTLY_HIGH
        return ratingsValid
    }
}
