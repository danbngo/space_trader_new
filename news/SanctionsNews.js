class SanctionsNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} imposes economic sanctions on ${coloredName(targetPlanet)}, damaging both economies!`,
            `${coloredName(planet)}'s sanctions on ${coloredName(targetPlanet)} have been lifted!`,
            `${coloredName(planet)}'s sanctions on ${coloredName(targetPlanet)} backfire, causing more domestic harm!`,
            `${coloredName(planet)} ends sanctions on ${coloredName(targetPlanet)} as relations normalize!`,
            NT.SANCTIONS, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                stockpile: CL.LOW,
                economy: CL.LOW,
                credits: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                stockpile: CL.VERY_LOW,
                economy: CL.VERY_LOW,
                labor: CL.LOW,
                credits: CL.LOW,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering damage after
        Object.assign(this.completeEffects[0], {
            economy: News.clHalfRegression(this.completeEffects[0].economy),
            credits: News.clHalfRegression(this.completeEffects[0].credits),
        })
        Object.assign(this.completeEffects[1], {
            economy: News.clHalfRegression(this.completeEffects[1].economy),
        })

        // Failed: sanctions backfire, hurt sanctioner more
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.VERY_LOW, // domestic economic crisis
                credits: CL.LOW,
                prestige: CL.LOW, // policy failure
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                economy: News.clHalfRegression(CL.VERY_LOW), // partial damage
            })
        ]

        // Cancelled: relations improve, sanctions dropped
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                stockpile: News.clHalfRegression(CL.LOW),
                economy: News.clHalfRegression(CL.LOW),
                credits: News.clHalfRegression(CL.SLIGHTLY_LOW),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                stockpile: News.clHalfRegression(CL.VERY_LOW),
                economy: News.clHalfRegression(CL.VERY_LOW),
                credits: News.clHalfRegression(CL.LOW),
            })
        ]
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if relationship improved
        const rel = planet.civilization.relationships.get(targetPlanet)
        if (rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY) {
            this.cancelled = true
            return
        }
        // Sanctions fail if sanctioner's economy weakens too much
        const failProbability = 1 - planet.civilization.economy
        this.failed = Math.random() < failProbability * 0.3
    }

    isValid() {
        const {planet, targetPlanet} = this
        //we need a strong economy to pull it off
        const ratingsValid = planet.civilization.economy > CL.HIGH && planet.settlement.wealth >= CL.HIGH
        //aggressor must be hostile towards victim
        const aggressorRelationship = planet.civilization.relationships.get(targetPlanet)
        const relationshipsValid = aggressorRelationship == RELATIONSHIP_TYPES.TENSE
        //blocked if already at war or other hostile actions
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.SANCTIONS, ...NT_COOPERATIVE])
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
