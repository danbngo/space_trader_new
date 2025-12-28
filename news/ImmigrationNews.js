class ImmigrationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)}'s wealth attracts a massive wave of immigration from ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s flood of immigration from ${coloredName(targetPlanet)} subsides.`,
            NEWS_TYPES.IMMIGRATION, planet, targetPlanet
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
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Source must have population to give, target must have economic opportunity
        const ratingsValid = planet.culture.population < CL.HIGH && planet.culture.economy > CL.SLIGHTLY_HIGH && targetPlanet.culture.population > CL.LOW
        // Must not be at war
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel != RELATIONSHIP_TYPES.WAR)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.IMMIGRATION]) ||
            News.planetHasAnyNews(targetPlanet, NEWS_TYPES_ECONOMY_PREVENTING)
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}