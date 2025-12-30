class ConscriptionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} institutes mandatory military conscription! Citizens are drafted en masse into the armed forces!`,
            `${coloredName(planet)}'s forced conscription program ends as its goals have been reached!`,
            `Mass riots force ${coloredName(planet)} to abandon conscription program!`,
            ``,
            NT.CONSCRIPTION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
            })
        ]
        this.completeEffects = [
            new NewsEffect({
                planet: this.planet,
                army: CL.VERY_HIGH,
                navy: CL.VERY_HIGH,
                education: CL.HIGH // trained conscripts
            })
        ]
        
        // Failed: riots force abandonment, no military gain
        this.failEffects = this.startEffects.map(fx=> fx.getInverse())
        Object.assign(this.failEffects[0], {
            prestige: CL.LOW,
            security: CL.LOW,
            crime: CL.HIGH,
        })
    }

    determineOutcome() {
        const {planet: p} = this
        // Conscription fails if population revolts (low security, high population)
        this.rollOutcome(p.c.security*p.c.prestige, CL.LOW)
    }

    isValid() {
        const {planet: p} = this
        // More likely if military is low or security is low (militarizing society)
        const ratingsValid = p.c.military < CL.LOW && p.c.population > CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(planet, [NT.CONSCRIPTION])
        return ratingsValid && !interferingEvent
    }
}
