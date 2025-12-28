class ResearchAgreementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} and ${coloredName(targetPlanet)} announce a joint research project!`,
            `${coloredName(planet)} and ${coloredName(targetPlanet)} conclude their joint research project!`,
            NEWS_TYPES.RESEARCH_AGREEMENT, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                credits: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ISOTOPES, 2]]),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                credits: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ISOTOPES, 2]]),
            }),      
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //actual knowledge gained cannot be lost
        Object.assign(this.endEffects[0], {
            shipQuality: CL.SLIGHTLY_HIGH,
            officerQuality: CL.HIGH,
            military: CL.SLIGHTLY_HIGH,
        })
        Object.assign(this.endEffects[1], {
            shipQuality: CL.SLIGHTLY_HIGH,
            officerQuality: CL.HIGH,
            military: CL.SLIGHTLY_HIGH,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planets must be neutral or allied towards each other
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //planets must have similar level of development
        const developmentValid = Math.abs(planet.culture.officerQuality - targetPlanet.culture.officerQuality) < 0.5
        //removed most requirements for this
        const interferingEvent =
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.RESEARCH_AGREEMENT, ...NEWS_TYPES_HOSTILE])
        return relationshipsValid && !interferingEvent && developmentValid
    }
}
