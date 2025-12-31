class ConscriptionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} institutes mandatory military conscription! Citizens are drafted en masse into the armed forces!`,
            `${coloredName(planet)}'s forced conscription program ends as its goals have been reached!`,
            `Mass riots force ${coloredName(planet)} to abandon conscription program!`,
            ``,
            NT.CONSCRIPTION, planet
        )

        this.addPlanetEffect(
            {
                planet: this.planet,
                population: CL.LOW,
                economy: CL.LOW,
            },
            {
                army: CL.VERY_HIGH,
            },
            {
                prestige: CL.LOW,
                security: CL.LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Conscription fails if population revolts (low security, high population)
        this.rollOutcome(p.c.security*p.c.culture*p.c.prestige, CL.LOW)
    }

    isValid() {
        const {planet: p} = this
        // More likely if military is low or security is low (militarizing society)
        const ratingsValid = p.c.army < CL.VERY_LOW
        // will not happen if we are not tense with anyone
        const numTenseRelationships = Array.from(p.c.relationships.values()).filter(v=>(v == RELATIONSHIP_TYPES.TENSE || v == RELATIONSHIP_TYPES.WAR)).length
        return ratingsValid && numTenseRelationships > 0
    }
}
