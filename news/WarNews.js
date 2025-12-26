class WarNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} declares war on ${coloredName(targetPlanet)}!`,
            `Peace treaty signed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            NEWS_TYPES.WAR, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.WAR,
                militaryRatingModifiedBy: 1.3,
                securityRatingModifiedBy: 1.2,
                commercialRatingModifiedBy: 0.7,
                shipyardNumShipsModifiedBy: 0.7,
                marketCargoAmountsModifiedBy: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 2], [CARGO_TYPES.ANTIMATTER, 3]]),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.WAR,
                militaryRatingModifiedBy: 1.3,
                securityRatingModifiedBy: 1.2,
                commercialRatingModifiedBy: 0.7,
                shipyardNumShipsModifiedBy: 0.7,
                marketCargoAmountsModifiedBy: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 2], [CARGO_TYPES.ANTIMATTER, 3]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        for (const fx of this.endEffects) {
            fx.onApply = ()=>{
                //dont revert relationships if one was vassalized
                if (planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR) planet.culture.relationships.set(targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
            }
        }
    }

    isValid() {
        const {planet, targetPlanet} = this
        //must not have same form of government
        const governmentsValid = (planet.culture.governmentType !== targetPlanet.culture.governmentType)
        //must not be anarchic or a puppet state
        const agencyValid = (planet.culture.governmentType !== GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType !== GOVERNMENT_TYPES.PUPPET_STATE)
        //target cant be a puppet state
        const fairTargetValid = (targetPlanet.culture.governmentType !== GOVERNMENT_TYPES.PUPPET_STATE)
        //planets must be hostile
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipValid = relationships.every(r => r === RELATIONSHIP_TYPES.HOSTILE)
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.WAR, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.WAR, planet) ||
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet) ||
            News.hasNews(planet, NEWS_TYPES.TRADE_AGREEMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TRADE_AGREEMENT, planet) ||
            News.hasNews(planet, NEWS_TYPES.RESEARCH_AGREEMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.RESEARCH_AGREEMENT, planet)
        return governmentsValid && agencyValid && fairTargetValid &&relationshipValid && !interferingEvent
    }
}
