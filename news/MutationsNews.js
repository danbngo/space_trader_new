class MutationsNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Radiation causes random mutations in the population on ${coloredName(planet)}, causing social unrest and unease!`,
            `${coloredName(planet)}'s health system proves capable of dealing with the harmful mutations while some prove beneficial!`,
            `Society on ${coloredName(planet)} ostracizes the mutants, forcing them to live in isolated ghettos!`,
            `Mutants continue to emerge on ${coloredName(planet)}, straining social cohesion!`,
            NT.MUTATIONS, planet
        )

        this.addPlanetEffect(
            {
                culture: CL.MEDIUM,
                corruption: CL.SLIGHTLY_HIGH,
                crime: CL.SLIGHTLY_HIGH
            },
            {
                education: CL.SLIGHTLY_HIGH,
                commerce: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                population: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_LOW
            },
            {
                culture: CL.VERY_HIGH,
                corruption: CL.HIGH,
                crime: CL.HIGH,
                education: CL.MEDIUM,
                population: CL.MEDIUM,
                economy: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on education (understanding), technology (medical care), and culture (acceptance)
        this.rollOutcome(p.c.education * p.c.technology * p.c.culture / (p.c.corruption * p.c.crime), CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high radiation levels
        const climateValid = p.climate.radiationLevel && p.climate.radiationLevel.value >= RADIATION_LEVELS.SLIGHTLY_HIGH.value
        
        // Needs settlement to have population
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        // Can't already have mutation events or certain plague events
        const interferingEvent = News.planetHasAnyNews(p, [NT.MUTATIONS, NT.PLAGUE, NT.PLAGUE_SPREAD, NT.BIOWEAPON])
        return climateValid && settlementValid && !interferingEvent
    }
}
