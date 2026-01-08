class RuinsDiscoveredNews extends News {
    constructor(planet = new Planet()) {
        super(
            `A ${coloredName(planet)} probe has photographed massive ruins in the Kuiper Belt—evidence of an ancient civilization predating recorded history!`,
            `After years of remote study and daring expeditions, ${coloredName(planet)}'s researchers have successfully documented and interpreted the Kuiper Belt ruins. The ancient civilization's legacy reveals revolutionary insights, forever changing the course of history!`,
            `After years of fruitless expeditions, ${coloredName(planet)}'s Kuiper Belt mission ends in disappointment. Critical data was lost in transmission failures, misinterpretations abound, and the ruins remain enigmatic. Resources wasted and questions unanswered haunt the project's legacy!`,
            ``,
            NT.RUINS_DISCOVERED, planet
        )
        
        // Pick random stats that will be affected
        const allStats = ['technology', 'industry', 'education', 'culture', 'prestige']
        this.successStats = rndMembers(allStats, rng(4, 2))
        this.failureStats = rndMembers(allStats, rng(4, 2))

        const successEffects = {}
        for (const stat of this.successStats) {
            successEffects[stat] = rng(CL.HIGH, CL.SLIGHTLY_HIGH)
        }

        const failureEffects = {}
        for (const stat of this.failureStats) {
            failureEffects[stat] = rng(CL.SLIGHTLY_HIGH, CL.SLIGHTLY_LOW)
        }

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.VERY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.SLIGHTLY_HIGH],
                    [CARGO_TYPES.ELECTRONICS, CL.SLIGHTLY_HIGH]
                ]))
            },
            successEffects,
            failureEffects
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success factors: high technology (reach ruins), high education (interpret), high culture (understand)
        this.rollOutcome(p.c.technology * p.c.education * p.c.culture, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires technology, navy (for long-range missions), and education
        if (p.c.technology < CL.SLIGHTLY_LOW) return false;
        if (p.c.navy < CL.SLIGHTLY_LOW) return false;
        if (p.c.education < CL.SLIGHTLY_LOW) return false;
        
        // Can't have multiple exploration megaprojects
        if (News.planetHasAnyNews(p, [NT.EXPLORATION, NT.ARTIFACTS_DISCOVERED, NT.ALIEN_LIFE_DISCOVERED, NT.RUINS_DISCOVERED])) return false;
        
        return true;
    }
}
