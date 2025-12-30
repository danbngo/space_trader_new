class OligarchyNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s economy is seized by powerful oligarchs who carve out private fiefdoms!`,
            `${coloredName(planet)}'s oligarchs lose their grip on power as the masses rise up!`,
            `${coloredName(planet)}'s oligarchs consolidate permanent control over the economy!`,
            ``,
            NT.OLIGARCHY, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    economy: CL.SLIGHTLY_LOW,
                    prestige: CL.SLIGHTLY_LOW,
                    industry: CL.SLIGHTLY_LOW,
                    security: CL.LOW,
                    wealth: CL.LOW
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Economy damage is permanent (oligarchs still control economy)
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            economy: CL.SLIGHTLY_LOW
        }))

        // Failed: oligarchs entrench permanently
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            economy: CL.NO_REGRESSION,  // Permanent economic damage
            prestige: CL.NO_REGRESSION,
            security: CL.NO_REGRESSION,
            wealth: CL.NO_REGRESSION,
            crime: CL.HIGH  // Corruption entrenched
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
    }

    determineOutcome() {
        const {planet: p} = this
        // Oligarchy overthrown if security strong enough to resist
        this.rollOutcome(p.c.security * 0.6 + 0.4)
    }

    isValid() {
        const {planet: p} = this
        // More likely if economy is high 
        const ratingsValid = (p.c.economy > CL.HIGH)
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NT.OLIGARCHY])
        return ratingsValid && !interferingEvent
    }
}
