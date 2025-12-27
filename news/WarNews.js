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
                military: CL.HIGH,
                security: CL.HIGH,
                commerce: CL.LOW,
                shipyardNumShips: CL.LOW,
                marketCargoAmounts: CL.LOW,
                prestige: CL.SLIGHTLY_LOW, //the aggressor loses some prestige
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 2], [CARGO_TYPES.ANTIMATTER, 3]]),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.WAR,
                military: CL.HIGH,
                security: CL.HIGH,
                commerce: CL.LOW,
                shipyardNumShips: CL.LOW,
                marketCargoAmounts: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 2], [CARGO_TYPES.ANTIMATTER, 3]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            prestige: News.CL_NO_REGRESSION, //being a warmonger = bad
        })


        this.endEffects[0].onApply = ()=>{
            //dont revert relationships if one was vassalized
            if (planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR) planet.culture.relationships.set(targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
            console.log('1 war ended between', planet.name, 'and', targetPlanet.name)
            console.log('1 new diplomatic status:', planet.culture.relationships.get(targetPlanet))
            console.log('1 target new diplomatic status:', targetPlanet.culture.relationships.get(planet))
        }
        this.endEffects[1].onApply = ()=>{
            //dont revert relationships if one was vassalized
            if (targetPlanet.culture.relationships.get(planet) == RELATIONSHIP_TYPES.WAR) targetPlanet.culture.relationships.set(planet, RELATIONSHIP_TYPES.NEUTRAL)
            console.log('2 war ended between', planet.name, 'and', targetPlanet.name)
            console.log('2 new diplomatic status:', planet.culture.relationships.get(targetPlanet))
            console.log('2 target new diplomatic status:', targetPlanet.culture.relationships.get(planet))
            //if there are no more wars remaining, and there was a world war, end the world war
            const numWarsRemaining = gs.system.news.filter(n=>(n.newsType == NEWS_TYPES.WAR && !n.ended)).length
            if (numWarsRemaining == 0) {
                const systemAtWarNews = gs.system.news.find(n=>(n.newsType == META_NEWS_TYPES.SYSTEM_AT_WAR && !n.ended))
                if (systemAtWarNews) {
                    console.log('cleaning up world war prematurely')
                    systemAtWarNews.endAsap = true
                    if (systemAtWarNews.shouldEnd()) systemAtWarNews.end()
                }
            }
        }
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planets tend not to want to go to war with stronger ones
        const prestigeValid = planet.culture.prestige > targetPlanet.culture.prestige || planet.culture.military > targetPlanet.culture.military
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
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.WAR, ...NEWS_TYPES_COOPERATIVE]) ||
            News.planetHasAnyNews(planet, NEWS_TYPES_CRIME_PREVENTING)
        return prestigeValid && governmentsValid && agencyValid && fairTargetValid &&relationshipValid && !interferingEvent
    }
}
