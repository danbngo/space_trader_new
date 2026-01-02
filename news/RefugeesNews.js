class RefugeesNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Refugees from ${coloredName(planet)} flee their crisis-torn planet, seeking asylum on ${coloredName(targetPlanet)}!`,
            `${coloredName(targetPlanet)} successfully integrates the refugees from ${coloredName(planet)}, enriching their culture and society!`,
            `${coloredName(targetPlanet)} aggressively turns back refugees from ${coloredName(planet)}, causing international condemnation!`,
            ``,
            NT.REFUGEES, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                population: CL.LOW
            },
            {
                population: CL.LOW,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.LOW,
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                population: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_LOW
            },
            {
                population: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                taxes: CL.SLIGHTLY_LOW
            },
            {
                population: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {targetPlanet: tp} = this
        // Success depends on target planet's culture, wealth, and lack of corruption/crime
        this.rollOutcome(tp.c.culture * tp.c.wealth / (tp.c.corruption * tp.c.crime), CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Source must have a dangerous event ongoing and low score
        const hasDangerousEvent = News.planetHasAnyNews(p, NT_DANGEROUS)
        const lowScore = p.c.score < CL.MEDIUM
        const sourceValid = hasDangerousEvent && lowScore
        
        // Must not be at war, target must have capacity
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        const targetValid = tp.c.economy > CL.SLIGHTLY_LOW && tp.c.population < CL.VERY_HIGH
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        return sourceValid && relationshipsValid && targetValid && !interferingEvent
    }
}
