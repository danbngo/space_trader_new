class WarSneakAttackNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches a devastating sneak attack on ${coloredName(targetPlanet)}'s navy while it's docked in port!`,
            `Peace treaty signed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            '',
            `War between ${coloredName(planet)} and ${coloredName(targetPlanet)} is called off prematurely!`,
            NT.WAR_SNEAK_ATTACK, planet, targetPlanet
        )

        const [p, tp] = [this.planet, this.targetPlanet]

        this.addPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.WAR,
                military: CL.SLIGHTLY_HIGH,
                reserves: CL.LOW,
                prestige: CL.SLIGHTLY_HIGH,
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
                    console.log('war ended between', this.planet.name, 'and', this.targetPlanet.name)
                    
                    // Check if world war should end
                    const numWarsRemaining = gs.system.news.filter(n => ([NT.WAR, NT.WAR_SNEAK_ATTACK, NT.WAR_FALSE_FLAG].includes(n.newsType) && !n.ended)).length
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

        this.addTargetPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.WAR,
                navy: CL.VERY_LOW,
                industry: CL.LOW,
                technology: CL.LOW,
                reserves: CL.LOW,
                prestige: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WEAPONS, 2],
                    [CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_HIGH],
                    [CARGO_TYPES.METAL, CL.VERY_HIGH]
                ]))
            },
            {
                onApply: () => {
                    if (tp.c.relationships.get(this.planet) == RELATIONSHIP_TYPES.WAR) {
                        tp.c.relationships.set(this.planet, RELATIONSHIP_TYPES.NEUTRAL)
                    }
                }
            }
        )

        this.cancelEffects = this.completeEffects.map(effect => effect.clone())
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must have higher security (better intelligence for sneak attack)
        const securityValid = p.c.security > tp.c.security && p.c.security > CL.MEDIUM
        // Target must have a navy worth attacking
        const navyValid = tp.c.navy > CL.SLIGHTLY_LOW
        // Must have capability to attack
        const capabilityValid = p.c.navy > CL.SLIGHTLY_LOW && p.c.military > CL.SLIGHTLY_LOW
        // Can be neutral or tense (sneak attack can start war)
        const relationshipValid = Civilization.areNeutral(p, tp) || Civilization.areTense(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [...NT_COOPERATIVE, NT.WAR, NT.WAR_SNEAK_ATTACK, NT.WAR_FALSE_FLAG])
        return securityValid && navyValid && capabilityValid && relationshipValid && !interferingEvent
    }
}
