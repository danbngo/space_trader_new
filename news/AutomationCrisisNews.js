class AutomationCrisisNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is replacing its workforce with automated systems at an unprecedented rate, sparking widespread anxiety about mass unemployment!`,
            `After years of careful planning, ${coloredName(planet)} has successfully transitioned to an automated economy. Displaced workers received retraining, universal basic income programs cushion the transition, and society adapts to a new era of prosperity!`,
            `After years of unchecked automation, ${coloredName(planet)} has fractured into a two-tier society. A tiny elite controls the automated economy while a massive underclass struggles in poverty. Crime and social unrest surge as inequality reaches catastrophic levels!`,
            ``,
            NT.AUTOMATION_CRISIS, planet
        )

        this.addPlanetEffect(
            {
                industry: CL.HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH
            },
            {
                economy: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW
            },
            {
                crime: CL.HIGH, // Reduced from VERY_HIGH
                education: CL.HIGH,
                culture: CL.VERY_HIGH,
                economy: CL.HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success factors: high education (retraining), high wealth (social programs), high culture (cohesion), low corruption
        this.rollOutcome(p.c.education * p.c.wealth * p.c.culture / p.c.corruption, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires technology and industry
        if (p.c.technology < CL.SLIGHTLY_LOW) return false;
        if (p.c.industry < CL.SLIGHTLY_LOW) return false;
        
        // Can't have multiple labor crises
        if (News.planetHasAnyNews(p, [NT.LABOR_STRIKES, NT.AUTOMATION_CRISIS, NT.FORCED_LABOR])) return false;
        
        return true;
    }
}
