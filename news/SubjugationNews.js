class SubjugationNews extends News {
    constructor(planet = new Planet(), startYear = gs.year, targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} conquers ${coloredName(targetPlanet)}!`,
            `${coloredName(targetPlanet)} regains independence from ${coloredName(planet)}!`,
            NEWS_TYPES.SUBJUGATION, planet, targetPlanet, startYear
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.Sovereign,
                territoryModifiedBy: 1.4,
                militaryRatingModifiedBy: 1.1,
                commercialRatingModifiedBy: 1.2,
                industrialRatingModifiedBy: 1.1,
                marketCargoAmountsModifiedBy: 1.4,
                prestigeRatingModifiedBy: 1.2,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newGovernmentType: GOVERNMENT_TYPES.PUPPET_STATE,
                newRelationship: RELATIONSHIP_TYPES.Subject,
                territoryModifiedBy: 0.7,
                militaryRatingModifiedBy: 0.5,
                securityRatingModifiedBy: 0.6,
                commercialRatingModifiedBy: 0.7,
                industrialRatingModifiedBy: 0.75,
                marketCargoAmountsModifiedBy: 0.6,
                prestigeRatingModifiedBy: 0.6,
                relationsReset: true,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //subjugating others has some lingering positive effects on territory, government rating
        Object.assign(this.endEffects[0], {
            territoryModifiedBy: (1 + this.endEffects[0].territoryModifiedBy)/2,
            militaryRatingModifiedBy: (1 + this.endEffects[0].militaryRatingModifiedBy)/2,
        })
        //being subjugated has some lingering ill effects on territory, government rating
        Object.assign(this.endEffects[1], {
            territoryModifiedBy: (1 + this.endEffects[1].territoryModifiedBy)/2,
            militaryRatingModifiedBy: (1 + this.endEffects[1].militaryRatingModifiedBy)/2,
        })
    }

    static isValid(planet = new Planet(), targetPlanet = new Planet()) {
        //our army must be significantly better than theirs
        const ratingsValid = planet.culture.militaryRating > targetPlanet.culture.militaryRating*1.1
        //cant be anarchic or puppet state
        const agencyValid = (planet.culture.governmentType !== GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType !== GOVERNMENT_TYPES.PUPPET_STATE)
        //planet must be at war with the target
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.War
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.SUBJUGATION, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.SUBJUGATION, planet) ||
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet)
        return ratingsValid && agencyValid && relationshipValid && !interferingEvent
    }

}
