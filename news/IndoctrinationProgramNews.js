class IndoctrinationProgramNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins altering its education program to emphasize the sanctity of the state!`,
            `${coloredName(planet)}'s indoctrination program succeeds! Loyalty to the state is enhanced and social cohesion strengthens!`,
            `${coloredName(planet)}'s indoctrination program becomes a laughingstock as citizens reject the official narrative and activists exert pressure!`,
            ``,
            NT.INDOCTRINATION_PROGRAM, planet
        )

        this.addPlanetEffect(
            {
                education: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.HOLOCUBES, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                culture: CL.SLIGHTLY_HIGH,
                security: CL.HIGH
            },
            {
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )
        
        // Indoctrination strengthens native culture and identity
        this.startEffects[0].onApply = () => {
            if (this.planet instanceof Planet && this.planet.c.cultures) {
                this.planet.addCulture(this.planet, 0.02);
            }
        }
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on security, army, and corruption (authoritarian control)
        this.rollOutcome(p.c.security * p.c.army * p.c.corruption / (p.c.education * p.c.culture), CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires authoritarian tendencies
        const ratingsValid = p.c.security > CL.SLIGHTLY_LOW && p.c.education > CL.SLIGHTLY_LOW
        
        // Can't have multiple education events
        const interferingEvent = News.planetHasAnyNews(p, [NT.INDOCTRINATION_PROGRAM, NT.BRAIN_DRAIN, NT.PHILOSOPHICAL_DEBATES, NT.KNOWLEDGE_CODEX])
        return ratingsValid && !interferingEvent
    }
}
