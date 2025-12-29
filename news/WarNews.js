class WarNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} declares war on ${coloredName(targetPlanet)}!`,
            `Peace treaty signed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            '',
            `War between ${coloredName(planet)} and ${coloredName(targetPlanet)} is called off prematurely!`,
            NT.WAR, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.WAR,
                military: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_HIGH,
                economy: CL.LOW,
                shipyardNumShips: CL.LOW,
                marketCargoAmounts: CL.LOW,
                //prestige: CL.SLIGHTLY_LOW, //the aggressor loses some prestige
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 2], [CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_HIGH]]),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.WAR,
                military: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_HIGH,
                economy: CL.LOW,
                shipyardNumShips: CL.LOW,
                marketCargoAmounts: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 2], [CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_HIGH]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        /*Object.assign(this.endEffects[0], {
            prestige: CL.NO_REGRESSION, //being a warmonger = bad
        })*/


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
            const numWarsRemaining = gs.system.news.filter(n=>(n.newsType == NT.WAR && !n.ended)).length
            if (numWarsRemaining == 0) {
                const systemAtWarNews = gs.system.news.find(n=>(n.newsType == META_NT.SYSTEM_AT_WAR && !n.ended))
                if (systemAtWarNews) {
                    console.log('cleaning up world war prematurely')
                    systemAtWarNews.endAsap = true
                    if (systemAtWarNews.shouldEnd()) systemAtWarNews.end()
                }
            }
        }

        this.cancelEndEffects = this.endEffects.map(effect => effect.clone())
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if peace was forced (relationships changed during war)
        const currentRel1 = planet.culture.relationships.get(targetPlanet)
        const currentRel2 = targetPlanet.culture.relationships.get(planet)
        this.cancelled = (currentRel1 !== RELATIONSHIP_TYPES.WAR || currentRel2 !== RELATIONSHIP_TYPES.WAR)
    }

    isValid(ignorePolitics = false) {
        const {planet, targetPlanet} = this
        //planets tend not to want to go to war with stronger ones
        const prestigeValid = planet.culture.prestige > targetPlanet.culture.prestige || planet.culture.military > targetPlanet.culture.military
        //must not have same form of government
        const governmentsValid = (planet.culture.governmentType !== targetPlanet.culture.governmentType)
        //must not be anarchic or a puppet state
        //planets must be hostile
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipValid = relationships.every(r => r === RELATIONSHIP_TYPES.TENSE)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.WAR, ...NT_COOPERATIVE]) ||
            News.planetHasAnyNews(planet, NT_CRIME_PREVENTING)
        return (prestigeValid) && (governmentsValid) && (relationshipValid) && !interferingEvent
    }
}
