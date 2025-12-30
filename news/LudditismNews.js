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
                civilizationMultipliers: new Civilization({
                    technology: CL.VERY_LOW,
                    military: CL.SLIGHTLY_LOW,
                    economy: CL.SLIGHTLY_LOW,
                    industry: CL.SLIGHTLY_LOW,
                    education: CL.SLIGHTLY_LOW,
                    crime: CL.SLIGHTLY_LOW
                }),
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.HOLOCUBES, CL.VERY_LOW]
                ]))
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Population growth and prestige boost from simpler lifestyle
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            technology: CL.VERY_LOW,  // Tech knowledge lost
            education: CL.SLIGHTLY_LOW,  // Tech knowledge lost
            military: CL.SLIGHTLY_LOW,
            economy: CL.SLIGHTLY_LOW,
            industry: CL.SLIGHTLY_LOW,
            population: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            crime: CL.LOW,
            corruption: CL.LOW
        }))

        // Failed: movement collapses, no benefits
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            technology: CL.NO_REGRESSION,  // Tech degradation remains
            education: CL.NO_REGRESSION,
            military: CL.NO_REGRESSION,
            economy: CL.NO_REGRESSION,
            industry: CL.NO_REGRESSION,
            population: CL.SLIGHTLY_HIGH,  // Partial growth
            prestige: CL.LOW  // Movement failure
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
    }

    shouldCancel() {
        // Cancel if external military threats emerge
        for (const p of gs.system.planets) {
            if (p !== this.planet) {
                const rel = p.c.relationships.get(this.planet)
                if (rel === RELATIONSHIP_TYPES.TENSE || rel === RELATIONSHIP_TYPES.WAR) {
                    return true
                }
            }
        }
        return false
    }

    determineOutcome() {
        const {planet: p} = this
        // Movement succeeds unless economic pressures are too high
        const successProbability = p.c.economy * 0.75 + 0.25
        this.rollOutcome(successProbability)
    }

    isValid() {
        const {planet: p} = this
        //more likely if high tech and population pressure
        const ratingsValid = p.c.technology > CL.HIGH && p.c.industry > CL.MEDIUM
        //must not be at engaged in or targeted by any hostile acts
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.LUDDITISM, ...NT_DANGEROUS]) ||
            News.planetHasAnyNewsTargeting(planet, NT_DANGEROUS) 
        return ratingsValid && !interferingEvent
    }
}
