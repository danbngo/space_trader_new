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
        return Civilization.areAtWar(this.planet, this.targetPlanet)
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
        const relationships = [p.c.relationships.get(tp), tp.c.relationships.get(p)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //planets must have similar level of development
        const developmentValid = Math.abs(p.c.education - tp.c.education) < 0.5
        //removed most requirements for this
        const interferingEvent =
            News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        return relationshipsValid && !interferingEvent && developmentValid
    }
}
