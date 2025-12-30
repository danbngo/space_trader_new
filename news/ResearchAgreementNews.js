class ResearchAgreementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} and ${coloredName(targetPlanet)} announce a joint research project!`,
            `${coloredName(planet)} and ${coloredName(targetPlanet)} conclude their joint research project!`,
            `Research collaboration between ${coloredName(planet)} and ${coloredName(targetPlanet)} yields no breakthroughs!`,
            `Tensions force ${coloredName(planet)} and ${coloredName(targetPlanet)} to abandon research collaboration!`,
            NT.RESEARCH_AGREEMENT, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    wealth: CL.LOW
                }),
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, 2]]))
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    wealth: CL.LOW
                }),
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, 2]]))
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Actual knowledge gained cannot be lost
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            technology: CL.SLIGHTLY_HIGH,
            education: CL.HIGH,
            military: CL.SLIGHTLY_HIGH
        }))
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            technology: CL.SLIGHTLY_HIGH,
            education: CL.HIGH,
            military: CL.SLIGHTLY_HIGH
        }))

        // Failed: research yields nothing, wasted resources
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.NO_REGRESSION  // Money wasted
        }))
        this.failEffects[1].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.NO_REGRESSION
        }))

        // Cancelled: tensions end collaboration early
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.SLIGHTLY_HIGH,
            technology: CL.SLIGHTLY_HIGH,  // Partial gains
            education: CL.SLIGHTLY_HIGH
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.SLIGHTLY_HIGH,
            technology: CL.SLIGHTLY_HIGH,
            education: CL.SLIGHTLY_HIGH
        }))
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if relationship deteriorated
        const rel1 = p.c.relationships.get(tp)
        const rel2 = tp.c.relationships.get(p)
        return rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.WAR ||
               rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.WAR
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Research succeeds based on combined education quality
        const avgQuality = (p.c.education + tp.c.education) / 2
        this.rollOutcome(avgQuality * 0.7 + 0.2)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //planets must be neutral or allied towards each other
        const relationships = [p.c.relationships.get(targetPlanet), tp.c.relationships.get(planet)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //planets must have similar level of development
        const developmentValid = Math.abs(p.c.education - tp.c.education) < 0.5
        //removed most requirements for this
        const interferingEvent =
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.RESEARCH_AGREEMENT, ...NT_COOPERATION_PREVENTING])
        return relationshipsValid && !interferingEvent && developmentValid
    }
}
