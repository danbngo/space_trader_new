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
                navy: CL.LOW, //blockade stretches fleet thin
                prestige: CL.SLIGHTLY_HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                prestige: CL.SLIGHTLY_LOW,
                economy: CL.VERY_LOW,
                inflation: CL.VERY_HIGH,
                reserves: CL.LOW,
                corruption: CL.HIGH,
                crime: CL.LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.WATER, CL.VERY_HIGH], [CARGO_TYPES.METAL, CL.VERY_HIGH]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //dont fully recover economy
        Object.assign(this.completeEffects[0], {
            prestige: News.clHalfRegression(this.completeEffects[0].prestige),
            economy: News.clHalfRegression(this.completeEffects[0].economy),
        })

        // Cancelled: relations improve, embargo lifted early
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                navy: News.clHalfRegression(CL.LOW),
                prestige: News.clHalfRegression(CL.SLIGHTLY_HIGH),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                economy: News.clHalfRegression(CL.VERY_LOW),
                inflation: News.clHalfRegression(CL.VERY_HIGH),
                reserves: News.clHalfRegression(CL.LOW),
            })
        ]
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if relationship improved to neutral
        const rel = planet.civilization.relationships.get(targetPlanet)
        if (rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY) {
            this.cancelled = true
        }
    }

    isValid() {
        const {planet, targetPlanet} = this
        //need to have enough ships for it
        const ratingsValid = planet.civilization.military > CL.MEDIUM
        //cant be anarchic or puppet state
        //planet must already be hostile to the target planet
        const relationshipValid = planet.civilization.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.TENSE || planet.civilization.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = 
            News.hasNews(NT.EMBARGO, planet, targetPlanet) || 
            News.hasAnyNewsBidirectional(planet, targetPlanet, NT_COOPERATIVE)
        return ratingsValid && relationshipValid && !interferingEvent
    }
}
