class WarNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} declares war on ${coloredName(targetPlanet)}!`,
            `Peace treaty signed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            '',
            `War between ${coloredName(planet)} and ${coloredName(targetPlanet)} is called off prematurely!`,
            NT.WAR, planet, targetPlanet
        )

        const [p, tp] = [this.planet, this.targetPlanet]

        this.addPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.WAR,
                military: CL.SLIGHTLY_HIGH,
                reserves: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WEAPONS, 2],
                    [CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_HIGH]
                ]))
            },
            {
                onApply: () => {
                    if (p.c.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR) {
                        p.c.relationships.set(targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
                    }
                    console.log('1 war ended between', this.planet.name, 'and', this.targetPlanet.name)
                    console.log('1 new diplomatic status:', p.c.relationships.get(targetPlanet))
                    console.log('1 target new diplomatic status:', tp.c.relationships.get(this.planet))
                }
            }
        )

        this.addTargetPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.WAR,
                military: CL.SLIGHTLY_HIGH,
                reserves: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WEAPONS, 2],
                    [CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_HIGH]
                ]))
            },
            {
                onApply: () => {
                    if (tp.c.relationships.get(this.planet) == RELATIONSHIP_TYPES.WAR) {
                        tp.c.relationships.set(this.planet, RELATIONSHIP_TYPES.NEUTRAL)
                    }
                    console.log('2 war ended between', this.planet.name, 'and', this.targetPlanet.name)
                    console.log('2 new diplomatic status:', p.c.relationships.get(this.targetPlanet))
                    console.log('2 target new diplomatic status:', tp.c.relationships.get(this.planet))
                    // If there are no more wars remaining, and there was a world war, end the world war
                    const numWarsRemaining = gs.system.news.filter(n => (n.newsType == NT.WAR && !n.ended)).length
                    if (numWarsRemaining == 0) {
                        const systemAtWarNews = gs.system.news.find(n => (n.newsType == META_NT.SYSTEM_AT_WAR && !n.ended))
                        if (systemAtWarNews) {
                            console.log('cleaning up world war prematurely')
                            systemAtWarNews.endAsap = true
                            if (systemAtWarNews.shouldEnd()) systemAtWarNews.end()
                        }
                    }
                }
            }
        )

        this.cancelEffects = this.completeEffects.map(effect => effect.clone())
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if peace was forced (relationships changed during war)
        const currentRel1 = p.c.relationships.get(targetPlanet)
        const currentRel2 = tp.c.relationships.get(planet)
        this.cancelled = (currentRel1 !== RELATIONSHIP_TYPES.WAR || currentRel2 !== RELATIONSHIP_TYPES.WAR)
    }

    isValid(ignorePolitics = false) {
        const {planet: p, targetPlanet: tp} = this
        //planets tend not to want to go to war with stronger ones
        const prestigeValid = p.c.prestige > tp.c.prestige || p.c.military > tp.c.military
        //must not have same form of government
        const governmentsValid = (p.c.governmentType !== tp.c.governmentType)
        //must not be anarchic or a puppet state
        //planets must be hostile
        const relationships = [p.c.relationships.get(targetPlanet), tp.c.relationships.get(planet)]
        const relationshipValid = relationships.every(r => r === RELATIONSHIP_TYPES.TENSE)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.WAR, ...NT_COOPERATIVE]) ||
            News.planetHasAnyNews(planet, NT_CRIME_PREVENTING)
        return (prestigeValid) && (governmentsValid) && (relationshipValid) && !interferingEvent
    }
}
