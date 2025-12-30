class MilitaryBuildupNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins a massive military buildup!`,
            `${coloredName(planet)}'s military buildup is complete! They host a grand military parade!`,
            `${coloredName(planet)}'s military buildup collapses due to economic constraints!`,
            ``,
            NT.MILITARY_BUILDUP, planet
        )
        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    economy: CL.LOW,
                    industry: CL.LOW,
                    reserves: CL.LOW,
                    wealth: CL.LOW
                }),
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WEAPONS, CL.VERY_HIGH],
                    [CARGO_TYPES.ANTIMATTER, 2]
                ]))
            })
        ]

        // Military effect is permanent
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            military: CL.EXTREMELY_HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            education: CL.HIGH,
            wealth: CL.NO_REGRESSION,  // Money wasted
            economy: CL.NO_REGRESSION,
            industry: CL.NO_REGRESSION
        }))

        // Failed: buildup collapses, no military gain
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.NO_REGRESSION,  // Money wasted
            economy: CL.NO_REGRESSION,  // Damage permanent
            industry: CL.NO_REGRESSION,
            prestige: CL.LOW  // Failed militarization
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
    }

    determineOutcome() {
        const {planet: p} = this
        // Buildup succeeds unless economy collapses during the process
        this.rollOutcome(p.c.economy * 0.65 + 0.35)
    }
    isValid() {
        const {planet: p} = this
        //dont do it if military is already big
        const ratingsValid = (p.c.military < CL.MEDIUM) && (p.c.prestige < CL.VERY_HIGH)
        //dont do it if no government are tense with us or vice versa
        let politicsValid = false
        for (const p of gs.system.planets) {
            if (p !== planet) {
                const relationship = p.c.relationships.get(p)
                const relationship2 = p.c.relationships.get(planet)
                if (relationship == RELATIONSHIP_TYPES.TENSE || relationship2 == RELATIONSHIP_TYPES.TENSE) {
                    politicsValid = true
                    break
                }
            }
        }
        //planet must not already be in anarchy or puppet state
        const validGov = p.c.governmentType != GT.ANARCHY && p.c.governmentType != GT.PUPPET_STATE
        //removed most requirements for this, even juntas do this on a whim
        const interferingEvent = News.planetHasAnyNews(planet, [NT.MILITARY_BUILDUP]) 
        return ratingsValid && validGov && !interferingEvent
    }
}
