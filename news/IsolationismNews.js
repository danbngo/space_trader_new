class IsolationismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} retreats into isolationism to take care of its own!`,
            `${coloredName(planet)} ends its isolationism!`,
            `External threats force ${coloredName(planet)} to abandon isolationism!`,
            ``,
            NT.ISOLATIONISM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                territory: CL.LOW,
                economy: CL.LOW,
                inflation: CL.LOW,
                reserves: CL.LOW,
                crime: CL.LOW,
                corruption: CL.LOW,
                wealth: CL.LOW,
                education: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW]]),
                forceWithdrawal: true,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering price increases and deflation
        Object.assign(this.completeEffects[0], {
            population: CL.SLIGHTLY_HIGH,
            security: CL.SLIGHTLY_HIGH,
            territory: News.clHalfRegression(this.completeEffects[0].territory), //territory is zero sum, so this will eventually lead to no one having any
            education: News.clHalfRegression(this.completeEffects[0].education), //lose some knowledge
            technology: News.clHalfRegression(this.completeEffects[0].technology), //lose some knowledge
            prestige: CL.NO_REGRESSION,
        })

        // Failed: forced to abandon due to external threats
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.NO_REGRESSION, // economic isolation damage persists
                wealth: CL.NO_REGRESSION,
                education: CL.NO_REGRESSION, // knowledge loss is permanent
                technology: CL.NO_REGRESSION,
                prestige: CL.LOW, // failed policy
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Isolationism fails if external threats emerge
        let threatsDetected = false
        for (const p of gs.system.planets) {
            if (p !== planet) {
                const rel = p.c.relationships.get(planet)
                if (rel === RELATIONSHIP_TYPES.TENSE || rel === RELATIONSHIP_TYPES.WAR) {
                    threatsDetected = true
                    break
                }
            }
        }
        this.failed = threatsDetected
    }

    isValid() {
        const {planet: p} = this
        //more likely after population collapse or being stretched thin
        const ratingsValid = planet.c.population < CL.SLIGHTLY_HIGH && planet.c.territory > CL.HIGH
        //must not be a puppet state or anarchic
        const interferingEvent =
            News.planetHasAnyNews(planet, NT_DANGEROUS) ||
            News.planetHasAnyNewsTargeting(planet, NT_DANGEROUS) 
        return ratingsValid && !interferingEvent
    }
}
