class BioweaponNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} secretly begins development of a devastating biological weapon!`,
            `${coloredName(planet)} successfully develops their bioweapon! Military strategists are thrilled by the new capabilities!`,
            `${coloredName(planet)}'s bioweapon escapes containment during testing! The pathogen ravages the population before countermeasures can be deployed!`,
            ``,
            NT.BIOWEAPON, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.HIGH,
                wealth: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.MEDICINE, CL.VERY_HIGH],
                    [CARGO_TYPES.ISOTOPES, CL.HIGH]
                ]))
            },
            {
                army: CL.HIGH,
                technology: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                onApply: () => {
                    // On failure, trigger a plague event
                    const plagueEvent = new PlagueNews(planet)
                    if (plagueEvent.isValid()) {
                        plagueEvent.start()
                    }
                },
                population: CL.LOW,
                army: CL.LOW,
                culture: CL.LOW,
                prestige: CL.VERY_LOW,
                economy: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Check if planet has plague vaccine - if so, automatically succeed
        if (News.planetHasAnyNews(p, [NT.PLAGUE_VACCINE])) {
            return
        }
        // Success depends on technology, security protocols, and education
        this.rollOutcome(p.c.technology * p.c.security * p.c.education / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high tech and military focus
        const ratingsValid = p.c.technology > CL.HIGH 
            && p.c.army > CL.SLIGHTLY_HIGH
            && p.c.wealth > CL.SLIGHTLY_LOW
        return ratingsValid
    }
}
