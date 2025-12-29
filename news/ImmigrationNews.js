class ImmigrationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)}'s wealth attracts a massive wave of immigration from ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s flood of immigration from ${coloredName(targetPlanet)} subsides.`,
            `${coloredName(planet)}'s economic downturn causes immigrants from ${coloredName(targetPlanet)} to return home!`,
            `Rising tensions force ${coloredName(planet)} to close borders to ${coloredName(targetPlanet)}!`,
            NT.IMMIGRATION, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                population: CL.HIGH, // gaining population
                economy: CL.SLIGHTLY_HIGH,
                security: CL.LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                population: CL.LOW, // losing population
                economy: CL.SLIGHTLY_LOW, //ppl wouldnt be leaving if there were jobs there
            }),
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Source: population loss is permanent
        Object.assign(this.endEffects[0], {
            population: CL.NO_REGRESSION, // people don't come back
            economy: News.clHalfRegression(this.endEffects[0].economy),
        })
        // Target: population boost lingers
        Object.assign(this.endEffects[1], {
            population: CL.NO_REGRESSION, // population gain is permanent
            economy: News.clHalfRegression(this.endEffects[0].economy),
        })

        // Failed: economic collapse, immigrants return
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                population: News.clHalfRegression(CL.HIGH), // some stayed
                security: CL.NO_REGRESSION, // instability persists
                economy: CL.LOW, // economic crisis
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                population: News.clHalfRegression(CL.LOW), // some returned
            })
        ]

        // Cancelled: borders closed early
        this.cancelEndEffects = [
            new NewsEffect({
                planet: this.planet,
                population: News.clHalfRegression(CL.HIGH),
                economy: News.clHalfRegression(CL.SLIGHTLY_HIGH),
                security: News.clHalfRegression(CL.LOW),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                population: News.clHalfRegression(CL.LOW),
            })
        ]
    }

    determineEnding() {
        const {planet, targetPlanet} = this
        // Check if relationship deteriorated
        const rel1 = planet.culture.relationships.get(targetPlanet)
        const rel2 = targetPlanet.culture.relationships.get(planet)
        if (rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.WAR ||
            rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.WAR) {
            this.cancelled = true
            return
        }
        // Immigration fails if economy collapses
        const failProbability = (1 - planet.culture.economy) * 0.3
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Source must have population to give, target must have economic opportunity
        const ratingsValid = planet.culture.population < CL.HIGH && planet.culture.economy > CL.SLIGHTLY_HIGH && targetPlanet.culture.population > CL.LOW
        // Must not be at war
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel != RELATIONSHIP_TYPES.WAR)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.IMMIGRATION]) ||
            News.planetHasAnyNews(targetPlanet, NT_ECONOMY_PREVENTING)
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}