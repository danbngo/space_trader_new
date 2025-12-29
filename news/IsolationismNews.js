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
                marketPrices: CL.LOW,
                marketCargoAmounts: CL.LOW,
                blackMarketCargoAmounts: CL.LOW,
                blackMarketPrices: CL.LOW,
                credits: CL.LOW,
                officerQuality: CL.SLIGHTLY_LOW,
                shipQuality: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW]]),
                forceWithdrawal: true,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering price increases and deflation
        Object.assign(this.endEffects[0], {
            population: CL.SLIGHTLY_HIGH,
            security: CL.SLIGHTLY_HIGH,
            territory: News.clHalfRegression(this.endEffects[0].territory), //territory is zero sum, so this will eventually lead to no one having any
            officerQuality: News.clHalfRegression(this.endEffects[0].officerQuality), //lose some knowledge
            shipQuality: News.clHalfRegression(this.endEffects[0].shipQuality), //lose some knowledge
            prestige: CL.NO_REGRESSION,
        })

        // Failed: forced to abandon due to external threats
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.NO_REGRESSION, // economic isolation damage persists
                credits: CL.NO_REGRESSION,
                officerQuality: CL.NO_REGRESSION, // knowledge loss is permanent
                shipQuality: CL.NO_REGRESSION,
                prestige: CL.LOW, // failed policy
            })
        ]
    }

    determineEnding() {
        const {planet} = this
        // Isolationism fails if external threats emerge
        let threatsDetected = false
        for (const p of gs.system.planets) {
            if (p !== planet) {
                const rel = p.culture.relationships.get(planet)
                if (rel === RELATIONSHIP_TYPES.TENSE || rel === RELATIONSHIP_TYPES.WAR) {
                    threatsDetected = true
                    break
                }
            }
        }
        this.failed = threatsDetected
    }

    isValid() {
        const {planet} = this
        //more likely after population collapse or being stretched thin
        const ratingsValid = planet.culture.population < CL.SLIGHTLY_HIGH && planet.culture.territory > CL.HIGH
        //must not be a puppet state or anarchic
        const governmentValid = (planet.culture.governmentType != GT.PUPPET_STATE) && (planet.culture.governmentType != GT.ANARCHY)
        //must not be at engaged in or targeted by any hostile acts
        const interferingEvent =
            News.planetHasAnyNews(planet, NT_DANGEROUS) ||
            News.planetHasAnyNewsTargeting(planet, NT_DANGEROUS) 
        return ratingsValid && governmentValid && !interferingEvent
    }
}
