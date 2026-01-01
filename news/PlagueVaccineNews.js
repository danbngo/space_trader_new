class PlagueVaccineNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches a massive vaccination program to protect against plague outbreaks!`,
            `${coloredName(planet)}'s vaccination program is complete! The population is now immune to plague!`,
            ``, // No failure - long duration event
            `${coloredName(planet)}'s vaccination program ends as new plague variants require updated vaccines!`,
            NT.PLAGUE_VACCINE, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.MEDICINE, CL.VERY_HIGH]
                ]))
            },
            {
                taxes: CL.HIGH,
                security: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH
            },
            {},
            {
                security: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        // Always succeeds - this is a long-term preventative program
    }

    isValid() {
        const {planet: p} = this
        // Requires decent tech and medical infrastructure
        const ratingsValid = p.c.technology > CL.SLIGHTLY_HIGH 
            && p.c.education > CL.SLIGHTLY_HIGH
            && p.c.wealth > CL.SLIGHTLY_LOW
        return ratingsValid
    }
}
