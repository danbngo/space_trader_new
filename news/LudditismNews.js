class LudditismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} embraces a return-to-soil movement, rejecting advanced technology for a simpler life!`,
            `${coloredName(planet)}'s people have completed their transition to a more pastoral life!`,
            `${coloredName(planet)}'s luddite movement collapses as technological needs overwhelm ideology!`,
            ``,
            NT.LUDDITISM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                shipQuality: CL.VERY_LOW,
                military: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                officerQuality: CL.SLIGHTLY_LOW,
                crime: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([
                    [CARGO_TYPES.NANITES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.HOLOCUBES, CL.VERY_LOW]
                ]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //population growth and prestige boost from simpler lifestyle
        Object.assign(this.endEffects[0], {
            population: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            shipQuality: News.clHalfRegression(this.endEffects[0].shipQuality), //tech knowledge lost
            officerQuality: News.clHalfRegression(this.endEffects[0].officerQuality), //tech knowledge lost
            military: News.clHalfRegression(this.endEffects[0].military),
            economy: News.clHalfRegression(this.endEffects[0].economy),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            crime: News.clHalfRegression(this.endEffects[0].crime),
            blackMarketCargoAmounts: CL.LOW,
            blackMarketPrices: CL.LOW,
        })

        // Failed: movement collapses, no benefits
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                shipQuality: CL.NO_REGRESSION, // tech degradation remains
                officerQuality: CL.NO_REGRESSION,
                military: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
                population: News.clHalfRegression(CL.HIGH), // partial growth
                prestige: CL.LOW, // movement failure
            })
        ]
    }

    determineEnding() {
        const {planet} = this
        // Movement fails if external pressures (economy/military threats)
        let threatsDetected = false
        for (const p of gs.system.planets) {
            if (p !== planet) {
                const rel = p.culture.relationships.get(planet)
                if (rel === RELATIONSHIP_TYPES.TENSE || rel === RELATIONSHIP_TYPES.TENSE || rel === RELATIONSHIP_TYPES.WAR) {
                    threatsDetected = true
                    break
                }
            }
        }
        const failProbability = threatsDetected ? 0.5 : ((1 - planet.culture.economy) * 0.25)
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet} = this
        //more likely if high tech and population pressure
        const ratingsValid = planet.culture.shipQuality > CL.HIGH && planet.culture.industry > CL.MEDIUM
        //must not be at engaged in or targeted by any hostile acts
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.LUDDITISM, ...NT_DANGEROUS]) ||
            News.planetHasAnyNewsTargeting(planet, NT_DANGEROUS) 
        return ratingsValid && !interferingEvent
    }
}
