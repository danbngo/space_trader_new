class TensionsNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Tensions rise between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Tensions cease between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            NEWS_TYPES.TENSIONS, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.HOSTILE,
                militaryRatingModifiedBy: 1.1,
                commercialRatingModifiedBy: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, 1.5]]),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.HOSTILE,
                militaryRatingModifiedBy: 1.1,
                commercialRatingModifiedBy: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, 1.5]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        for (const fx of this.endEffects) {
            fx.onApply = ()=>{
                if (planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.HOSTILE) planet.culture.relationships.set(targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
            }
        }
    }

    isValid() {
        const {planet, targetPlanet} = this
        //cant have same government type or be a puppet
        const governmentsValid = planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE && targetPlanet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        const governmentsValid2 = planet.culture.governmentType != targetPlanet.culture.governmentType
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.NEUTRAL && targetPlanet.culture.relationships.get(planet) == RELATIONSHIP_TYPES.NEUTRAL
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.TENSIONS, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TENSIONS, planet) ||
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet) ||
            News.hasNews(planet, NEWS_TYPES.WAR, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.WAR, planet) ||
            News.hasNews(planet, NEWS_TYPES.BOMBARDMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.BOMBARDMENT, planet) ||
            News.hasNews(planet, NEWS_TYPES.TRADE_AGREEMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TRADE_AGREEMENT, planet) ||
            News.hasNews(planet, NEWS_TYPES.RESEARCH_AGREEMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.RESEARCH_AGREEMENT, planet)
        return governmentsValid && governmentsValid2 && relationshipValid && !interferingEvent
    }

    isValidEnd() {
        const {planet, targetPlanet} = this
        //can only end if planets are not actively at war
        const relationshipsValid = planet.culture.relationships.get(targetPlanet) != RELATIONSHIP_TYPES.WAR && targetPlanet.culture.relationships.get(planet) != RELATIONSHIP_TYPES.WAR
        return relationshipsValid
    }
}
