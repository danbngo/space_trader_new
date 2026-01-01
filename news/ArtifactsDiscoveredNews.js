class ArtifactsDiscoveredNews extends News {
    constructor(planet = new Planet()) {
        super(
            `An expedition on ${coloredName(planet)} has unearthed alien artifacts of unknown origin and purpose, sparking intense scientific interest!`,
            `After years of painstaking research, scientists on ${coloredName(planet)} have successfully decoded the alien artifacts. The breakthrough revolutionizes multiple fields, propelling the planet into a new era of advancement!`,
            `After years of fruitless study, researchers on ${coloredName(planet)} admit defeat. The artifacts remain inscrutable, and years of wasted resources have left scars on multiple sectors. Some artifacts even triggered unpredictable effects during testing!`,
            ``,
            NT.ARTIFACTS_DISCOVERED, planet
        )

        // Pick random stats that will be affected
        const allStats = ['technology', 'industry', 'education', 'culture', 'economy', 'wealth']
        this.successStats = rndMembers(allStats, rng(4, 2))
        this.failureStats = rndMembers(allStats, rng(4, 2))

        const successEffects = { prestige: CL.HIGH }
        for (const stat of this.successStats) {
            successEffects[stat] = rng(CL.SLIGHTLY_HIGH, CL.SLIGHTLY_LOW)
        }

        const failureEffects = {}
        for (const stat of this.failureStats) {
            failureEffects[stat] = rng(CL.SLIGHTLY_HIGH, CL.SLIGHTLY_LOW)
        }

        this.addPlanetEffect(
            {
                taxes: CL.HIGH,
                wealth: CL.SLIGHTLY_HIGH
            },
            successEffects,
            failureEffects
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success factors: high technology, high education, high culture (careful study)
        this.rollOutcome(p.c.technology * p.c.education * p.c.culture, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires technology and education for research
        if (p.c.technology < CL.SLIGHTLY_LOW) return false;
        if (p.c.education < CL.SLIGHTLY_LOW) return false;
        
        // Can't have multiple exploration megaprojects
        if (News.planetHasAnyNews(p, [NT.EXPLORATION, NT.ARTIFACTS_DISCOVERED, NT.RUINS_DISCOVERED])) return false;
        
        return true;
    }
}
