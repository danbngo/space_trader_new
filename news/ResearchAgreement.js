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
                industrialRatingModifiedBy: 0.8,
                creditsModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ISOTOPES, 2]]),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                industrialRatingModifiedBy: 0.8,
                creditsModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ISOTOPES, 2]]),
            }),      
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //actual knowledge gained cannot be lost
        Object.assign(this.endEffects[0], {
            shipQualityModifiedBy: 1.1,
            prestigeRatingModifiedBy: 1.1,
            officerQualityModifiedBy: 1.2,
            militaryRatingModifiedBy: 1.1,
        })
        Object.assign(this.endEffects[1], {
            shipQualityModifiedBy: 1.1,
            prestigeRatingModifiedBy: 1.1,
            officerQualityModifiedBy: 1.2,
            militaryRatingModifiedBy: 1.1,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planets must be neutral or allied towards each other
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //planets must have similar level of development
        const developmentValid = Math.abs(planet.culture.officerQuality - targetPlanet.culture.officerQuality) < 0.5

        const interferingEvent =
            //News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.RESEARCH_AGREEMENT, ...NEWS_TYPES_PROGRESS_PREVENTING]) || //already covered below
            News.planetHasAnyNews(planet, NEWS_TYPES_PROGRESS_PREVENTING) ||
            News.planetHasAnyNews(targetPlanet, NEWS_TYPES_PROGRESS_PREVENTING)
        return relationshipsValid && !interferingEvent && developmentValid
    }
}
