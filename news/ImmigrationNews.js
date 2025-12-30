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
                civilizationMultipliers: new Civilization({
                    population: CL.HIGH,
                    economy: CL.SLIGHTLY_HIGH,
                    security: CL.LOW,
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                civilizationMultipliers: new Civilization({
                    population: CL.LOW,
                    economy: CL.SLIGHTLY_LOW,
                })
            }),
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.HIGH,
            economy: CL.SLIGHTLY_HIGH,
        }))
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            population: CL.LOW,
            economy: CL.SLIGHTLY_LOW,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_HIGH,
            security: CL.LOW,
            economy: CL.LOW,
        }))
        this.failEffects[1].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_LOW,
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            security: CL.SLIGHTLY_LOW,
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_LOW,
        }))
    }

    shouldCancel() {
        const rel1 = this.planet.c.relationships.get(this.targetPlanet)
        const rel2 = this.targetPlanet.c.relationships.get(this.planet)
        return rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.WAR ||
               rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.WAR
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.economy)
    }
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Source must have population to give, target must have economic opportunity
        const ratingsValid = p.c.population < CL.HIGH && p.c.economy > CL.SLIGHTLY_HIGH && tp.c.population > CL.LOW
        // Must not be at war
        const relationships = [p.c.relationships.get(targetPlanet), tp.c.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel != RELATIONSHIP_TYPES.WAR)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.IMMIGRATION]) ||
            News.planetHasAnyNews(targetPlanet, NT_ECONOMY_PREVENTING)
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}