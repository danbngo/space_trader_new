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
        this.endEffects = [
            new NewsEffect({
                planet: this.planet,
                military: CL.VERY_HIGH,
                guildNumOfficers: CL.VERY_HIGH
            })
        ]
        
        // Failed: riots force abandonment, no military gain
        this.failEndEffects = this.startEffects.map(fx=> fx.getInverse())
        Object.assign(this.failEndEffects[0], {
            prestige: CL.LOW,
            security: CL.LOW,
            crime: CL.HIGH,
        })
    }

    determineOutcome() {
        const {planet} = this
        // Conscription fails if population revolts (low security, high population)
        this.rollOutcome(planet.culture.security*planet.culture.prestige, CL.LOW)
    }

    isValid() {
        const {planet} = this
        // More likely if military is low or security is low (militarizing society)
        const ratingsValid = planet.culture.military < CL.LOW && planet.culture.population > CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(planet, [NT.CONSCRIPTION])
        return ratingsValid && !interferingEvent
    }
}
