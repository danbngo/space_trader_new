class DiasporaReturnsNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} experiences a population boom as members of its diaspora return from across the system!`,
            `${coloredName(planet)}'s returning diaspora forms a harmonious whole with the existing population!`,
            `Tensions erupt on ${coloredName(planet)} between returning diaspora and existing residents, triggering social unrest!`,
            ``,
            NT.DIASPORA_RETURNS, planet
        )

        this.addPlanetEffect(
            {
                population: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.HIGH,
                culture: CL.HIGH,
                education: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.HIGH,
                culture: CL.LOW,
                security: CL.SLIGHTLY_LOW,
                crime: CL.SLIGHTLY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on culture, education, and lack of corruption/crime
        this.rollOutcome(p.c.culture * p.c.education / (p.c.corruption * p.c.crime), CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Must have high score and no dangerous events
        const highScore = p.c.score > CL.HIGH
        const noDangerousEvents = !News.planetHasAnyNews(p, NT_DANGEROUS)
        
        // Must have economic capacity
        const ratingsValid = p.c.economy > CL.SLIGHTLY_HIGH && p.c.population < CL.VERY_HIGH
        
        const interferingEvent = News.planetHasAnyNews(p, [NT.IMMIGRATION, NT.REFUGEES, NT.DEPORTATION, NT.ASYLUM_POLICY, NT.DIASPORA_RETURNS])
        return highScore && noDangerousEvents && ratingsValid && !interferingEvent
    }
}
