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
                civilizationMultipliers: new Civilization({
                    population: CL.LOW,
                    economy: CL.LOW,
                    industry: CL.LOW,
                    taxes: CL.HIGH //to pay for the recruits
                })
            })
        ]
        this.completeEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    army: CL.VERY_HIGH,
                    navy: CL.HIGH,
                })
            })
        ]
        
        // Failed: riots force abandonment, no military gain
        this.failEffects = this.startEffects.map(fx=> fx.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            prestige: CL.LOW,
            security: CL.LOW,
            crime: CL.HIGH,
        }))
    }

    determineOutcome() {
        const {planet: p} = this
        // Conscription fails if population revolts (low security, high population)
        this.rollOutcome(p.c.security*p.c.culture*p.c.prestige, CL.LOW)
    }

    isValid() {
        const {planet: p} = this
        // More likely if military is low or security is low (militarizing society)
        const ratingsValid = p.c.army < CL.LOW && p.c.population > CL.MEDIUM
        // will not happen if we are not tense with anyone
        const numTenseRelationships = Array.from(p.c.relationships.values()).filter(v=>(v == RELATIONSHIP_TYPES.TENSE || v == RELATIONSHIP_TYPES.WAR)).length
        return ratingsValid && numTenseRelationships > 0
    }
}
