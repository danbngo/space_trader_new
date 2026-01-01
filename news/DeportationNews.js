class DeportationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} begins mass deportation of citizens with ${coloredName(planet)} ancestry on flimsy security pretexts!`,
            `${coloredName(planet)} welcomes back its deported citizens and successfully integrates them into society!`,
            `${coloredName(planet)} refuses to recognize the deported citizens, leaving them stranded on minor asteroids and moons!`,
            ``,
            NT.DEPORTATION, planet, targetPlanet
        )

        this.addPlanetEffect(
            {},
            {
                population: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_LOW
            },
            {
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW
            },
            {
                population: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            },
            {
                population: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on source planet's culture, economy, and lack of corruption
        this.rollOutcome(p.c.culture * p.c.economy / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Planets must be tense with each other
        const relationshipsValid = Civilization.areTense(p, tp)
        
        // Target must have population to deport, source must have capacity
        const ratingsValid = tp.c.population > CL.LOW && (tp.c.culture < CL.VERY_HIGH || tp.c.economy < CL.VERY_HIGH)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.IMMIGRATION, NT.REFUGEES, NT.DEPORTATION, NT.ASYLUM_POLICY])
        return relationshipsValid && ratingsValid && !interferingEvent
    }
}
