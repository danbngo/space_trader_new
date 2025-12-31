class ResearchAgreementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} and ${coloredName(targetPlanet)} announce a joint research project!`,
            `${coloredName(planet)} and ${coloredName(targetPlanet)} conclude their joint research project!`,
            `Research collaboration between ${coloredName(planet)} and ${coloredName(targetPlanet)} yields no breakthroughs!`,
            `Tensions force ${coloredName(planet)} and ${coloredName(targetPlanet)} to abandon research collaboration!`,
            NT.RESEARCH_AGREEMENT, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                planet: this.planet,
                wealth: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, 2]]))
            },
            {
                technology: CL.SLIGHTLY_HIGH,
                education: CL.HIGH,
            },
            {
                wealth: CL.NO_REGRESSION
            },
            {
                technology: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH
            }
        )

        this.addTargetPlanetEffect(
            {
                wealth: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, 2]]))  
            },
            {
                technology: CL.SLIGHTLY_HIGH,
                education: CL.HIGH,
            },
            {
                wealth: CL.NO_REGRESSION
            },
            {
                technology: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH
            }
        )
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
