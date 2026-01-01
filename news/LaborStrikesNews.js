class LaborStrikesNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Industry workers on ${coloredName(planet)} have walked out over wage disputes and working conditions, bringing production to a halt!`,
            `After years of negotiations, ${coloredName(planet)}'s government and labor unions have reached a historic agreement. Workers return to factories with improved wages, better conditions, and renewed morale!`,
            `After years of stalemate, the strike on ${coloredName(planet)} collapses amid violence and economic devastation. Workers return defeated, production resumes slowly, and deep resentment remains.`,
            ``,
            NT.LABOR_STRIKES, planet
        )

        this.addPlanetEffect(
            {
                industry: CL.VERY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            },
            {
                culture: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW
            },
            {
                industry: CL.HIGH,
                culture: CL.HIGH,
                economy: CL.HIGH,
                wealth: CL.HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success factors: high wealth (can afford better pay), high culture (values workers), low corruption
        this.rollOutcome(p.c.wealth * p.c.culture / (p.c.corruption * p.c.army * p.c.security), CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires industry
        if (p.c.industry < CL.SLIGHTLY_LOW) return false;
        
        // Can't have multiple labor crises
        if (News.planetHasAnyNews(p, [NT.LABOR_STRIKES, NT.AUTOMATION_CRISIS, NT.FORCED_LABOR])) return false;
        
        return true;
    }
}
