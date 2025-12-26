class AllianceNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Alliance formed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Alliance dissolved between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            NEWS_TYPES.ALLIANCE, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.ALLY,
                territoryModifiedBy: 1.2,
                marketCargoAmountsModifiedBy: 1.1,
                guildNumOfficersModifiedBy: 1.2,
                securityRatingModifiedBy: 1.1,
                commercialRatingModifiedBy: 1.1,
                officerQualityModifiedBy: 1.1,
                shipQualityModifiedBy: 1.1,
                prestigeRatingModifiedBy: 1.1,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.ALLY,
                territoryModifiedBy: 1.2,
                marketCargoAmountsModifiedBy: 1.1,
                guildNumOfficersModifiedBy: 1.2,
                securityRatingModifiedBy: 1.1,
                commercialRatingModifiedBy: 1.1,
                officerQualityModifiedBy: 1.1,
                shipQualityModifiedBy: 1.1,
                prestigeRatingModifiedBy: 1.1,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //this is the only relationship that cannot be dissolved mid-event
        for (const fx of this.endEffects) fx.newRelationship = RELATIONSHIP_TYPES.NEUTRAL
    }

    isValid() {
        const {planet, targetPlanet} = this
        //both planets must be currently neutral towards each other
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL)
        //most of the below shouldnt be possible based on above checked but just in case
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet) || 
            News.hasNews(planet, NEWS_TYPES.WAR, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.WAR, planet) ||
            News.hasNews(planet, NEWS_TYPES.TENSIONS, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TENSIONS, planet) ||
            News.hasNews(planet, NEWS_TYPES.BOMBARDMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.BOMBARDMENT, planet) ||
            News.hasNews(planet, NEWS_TYPES.PLAGUE) || News.hasNews(targetPlanet, NEWS_TYPES.PLAGUE)
        return relationshipsValid && !interferingEvent
    }
}
