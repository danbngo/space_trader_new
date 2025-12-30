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
                economy: CL.LOW,
                industry: CL.LOW,
                reserves: CL.LOW,
                wealth: CL.LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH], [CARGO_TYPES.ANTIMATTER, 2]]),
            })
        ]

        //military effect is permanent
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[0], {
                army: CL.EXTREMELY_HIGH,
                navy: CL.EXTREMELY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                education: CL.HIGH,
                wealth: CL.NO_REGRESSION, //so is wasting money
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
        })

        // Failed: buildup collapses, no military gain
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                wealth: CL.NO_REGRESSION, // money wasted
                economy: CL.NO_REGRESSION, // damage permanent
                industry: CL.NO_REGRESSION,
                prestige: CL.LOW, // failed militarization
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Buildup fails if economy collapses during the process
        const failProbability = (1 - planet.c.economy) * 0.35
        this.failed = Math.random() < failProbability
    }
    isValid() {
        const {planet: p} = this
        //dont do it if military is already big
        const ratingsValid = (planet.c.military < CL.MEDIUM) && (planet.c.prestige < CL.VERY_HIGH)
        //dont do it if no government are tense with us or vice versa
        let politicsValid = false
        for (const p of gs.system.planets) {
            if (p !== planet) {
                const relationship = planet.c.relationships.get(p)
                const relationship2 = p.c.relationships.get(planet)
                if (relationship == RELATIONSHIP_TYPES.TENSE || relationship2 == RELATIONSHIP_TYPES.TENSE) {
                    politicsValid = true
                    break
                }
            }
        }
        //planet must not already be in anarchy or puppet state
        const validGov = planet.c.governmentType != GT.ANARCHY && planet.c.governmentType != GT.PUPPET_STATE
        //removed most requirements for this, even juntas do this on a whim
        const interferingEvent = News.planetHasAnyNews(planet, [NT.MILITARY_BUILDUP]) 
        return ratingsValid && validGov && !interferingEvent
    }
}
