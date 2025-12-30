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
                wealth: CL.LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.ISOTOPES, 2]]),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                wealth: CL.LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.ISOTOPES, 2]]),
            }),
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //actual knowledge gained cannot be lost
        Object.assign(this.completeEffects[0], {
            technology: CL.SLIGHTLY_HIGH,
            education: CL.HIGH,
            army: CL.SLIGHTLY_HIGH,
            navy: CL.SLIGHTLY_HIGH,
        })
        Object.assign(this.completeEffects[1], {
            technology: CL.SLIGHTLY_HIGH,
            education: CL.HIGH,
            army: CL.SLIGHTLY_HIGH,
            navy: CL.SLIGHTLY_HIGH,
        })

        // Failed: research yields nothing, wasted resources
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                wealth: CL.NO_REGRESSION, // money wasted
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                wealth: CL.NO_REGRESSION,
            })
        ]

        // Cancelled: tensions end collaboration early
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                wealth: News.clHalfRegression(CL.LOW),
                technology: CL.SLIGHTLY_HIGH, // partial gains
                education: News.clHalfRegression(CL.HIGH),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                wealth: News.clHalfRegression(CL.LOW),
                technology: CL.SLIGHTLY_HIGH,
                education: News.clHalfRegression(CL.HIGH),
            })
        ]
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if relationship deteriorated
        const rel1 = planet.civilization.relationships.get(targetPlanet)
        const rel2 = targetPlanet.civilization.relationships.get(planet)
        if (rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.WAR ||
            rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.WAR) {
            this.cancelled = true
            return
        }
        // Research fails based on combined officer quality
        const avgQuality = (planet.civilization.education + targetPlanet.civilization.education) / 2
        const successProbability = avgQuality * 0.7 + 0.2
        this.failed = Math.random() > successProbability
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //planets must be neutral or allied towards each other
        const relationships = [planet.civilization.relationships.get(targetPlanet), targetPlanet.civilization.relationships.get(planet)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //planets must have similar level of development
        const developmentValid = Math.abs(planet.civilization.education - targetPlanet.civilization.education) < 0.5
        //removed most requirements for this
        const interferingEvent =
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.RESEARCH_AGREEMENT, ...NT_COOPERATION_PREVENTING])
        return relationshipsValid && !interferingEvent && developmentValid
    }
}
