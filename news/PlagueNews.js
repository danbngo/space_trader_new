class PlagueNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is struck by a vicious plague! The population is being decimated!`,
            `${coloredName(planet)} implements quarantines and rushes out a cure for their plague, saving millions of lives!`,
            `${coloredName(planet)} fails to contain the plague! The death toll is catastrophic!`,
            '',
            NT.PLAGUE, planet
        )

        this.addPlanetEffect(
            {
                population: CL.LOW,
                industry: CL.LOW,
                economy: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.MEDICINE, CL.ASTRONOMICAL]]))
            },
            {
                population: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
                taxes: CL.HIGH,
                reserves: CL.LOW,
                inflation: CL.HIGH,
            },
            {
                population: CL.EXTREMELY_LOW,
                industry: CL.VERY_LOW,
                economy: CL.VERY_LOW,
                army: CL.LOW,
                reserves: CL.LOW,
                culture: CL.LOW
            }
        )
    }

    determineOutcome() {
        //the LESS populous and interconnected you are the better
        this.rollOutcome(this.planet.c.taxes*this.planet.c.education*this.planet.c.technology/this.planet.c.population/this.planet.c.economy, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        //happens when population is getting out of hand AND either too interconnected, too dumb, or too little medicine
        const ratingsValid = p.c.population > CL.VERY_LOW && (p.c.economy > CL.HIGH || p.c.education < CL.SLIGHTLY_HIGH || p.c.technology > CL.HIGH)
        
        // Cannot occur if planet has active plague vaccine
        const hasVaccine = News.planetHasAnyNews(p, [NT.PLAGUE_VACCINE])
        
        // More likely on polluted worlds (weakened population health)
        const pollutionModifier = p.climate.pollution && p.climate.pollution.value >= POLLUTION_LEVELS.SLIGHTLY_HIGH.value
        
        return ratingsValid && !hasVaccine && pollutionModifier
    }
}
