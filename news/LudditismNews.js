class LudditismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} embraces a return-to-soil movement, rejecting advanced ships for a simpler life!`,
            `${coloredName(planet)}'s people have completed their transition to a more pastoral life!`,
            `${coloredName(planet)}'s luddite movement collapses as technological needs overwhelm ideology!`,
            ``,
            NT.LUDDITISM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                technology: CL.VERY_LOW,
                army: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                education: CL.SLIGHTLY_LOW,
                crime: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.HOLOCUBES, CL.VERY_LOW]
                ]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //population growth and prestige boost from simpler lifestyle
        Object.assign(this.completeEffects[0], {
            population: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            technology: News.clHalfRegression(this.completeEffects[0].technology), //tech knowledge lost
            education: News.clHalfRegression(this.completeEffects[0].education), //tech knowledge lost
            army: News.clHalfRegression(this.completeEffects[0].army),
            navy: News.clHalfRegression(this.completeEffects[0].navy),
            economy: News.clHalfRegression(this.completeEffects[0].economy),
            industry: News.clHalfRegression(this.completeEffects[0].industry),
            crime: CL.LOW,
            corruption: CL.LOW,
        })

        // Failed: movement collapses, no benefits
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                technology: CL.NO_REGRESSION, // tech degradation remains
                education: CL.NO_REGRESSION,
                army: CL.NO_REGRESSION,
                navy: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
                population: News.clHalfRegression(CL.HIGH), // partial growth
                prestige: CL.LOW, // movement failure
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Movement fails if external pressures (economy/military threats)
        let threatsDetected = false
        for (const p of gs.system.planets) {
            if (p !== planet) {
                const rel = p.c.relationships.get(planet)
                if (rel === RELATIONSHIP_TYPES.TENSE || rel === RELATIONSHIP_TYPES.TENSE || rel === RELATIONSHIP_TYPES.WAR) {
                    threatsDetected = true
                    break
                }
            }
        }
        const failProbability = threatsDetected ? 0.5 : ((1 - planet.c.economy) * 0.25)
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet: p} = this
        //more likely if high tech and population pressure
        const ratingsValid = planet.c.technology > CL.HIGH && planet.c.industry > CL.MEDIUM
        //must not be at engaged in or targeted by any hostile acts
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.LUDDITISM, ...NT_DANGEROUS]) ||
            News.planetHasAnyNewsTargeting(planet, NT_DANGEROUS) 
        return ratingsValid && !interferingEvent
    }
}
