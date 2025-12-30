class EmbargoNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Embargo imposed by ${coloredName(planet)} on ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)} lifts embargo on ${coloredName(targetPlanet)}!`,
            ``,
            `${coloredName(planet)}'s embargo on ${coloredName(targetPlanet)} collapses as relations improve!`,
            NT.EMBARGO, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    navy: CL.LOW,
                    prestige: CL.SLIGHTLY_HIGH,
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                civilizationMultipliers: new Civilization({
                    prestige: CL.SLIGHTLY_LOW,
                    economy: CL.VERY_LOW,
                    inflation: CL.VERY_HIGH,
                    reserves: CL.LOW,
                    corruption: CL.HIGH,
                    crime: CL.LOW,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WATER, CL.VERY_HIGH], [CARGO_TYPES.METAL, CL.VERY_HIGH]])),
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            prestige: CL.SLIGHTLY_LOW,
            economy: CL.SLIGHTLY_LOW,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            navy: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH,
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            economy: CL.SLIGHTLY_LOW,
            inflation: CL.SLIGHTLY_HIGH,
            reserves: CL.SLIGHTLY_LOW,
        }))
    }

    shouldCancel() {
        const rel = this.planet.c.relationships.get(this.targetPlanet)
        return rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY
    }

    determineOutcome() {
        // Outcome is handled by shouldCancel()
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //need to have enough ships for it
        const ratingsValid = p.c.military > CL.MEDIUM
        //cant be anarchic or puppet state
        //planet must already be hostile to the target planet
        const relationshipValid = p.c.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.TENSE || p.c.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = 
            News.hasNews(NT.EMBARGO, planet, targetPlanet) || 
            News.hasAnyNewsBidirectional(planet, targetPlanet, NT_COOPERATIVE)
        return ratingsValid && relationshipValid && !interferingEvent
    }
}
