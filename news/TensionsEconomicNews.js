class TensionsEconomicNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Economic tensions rise between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Economic tensions cease between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            '',
            `Economic tensions between ${coloredName(planet)} and ${coloredName(targetPlanet)} are swept aside by other events!`,
            NT.TENSIONS_ECONOMIC, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.TENSE,
                economy: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH], [CARGO_TYPES.WEAPONS, CL.HIGH], [CARGO_TYPES.ELECTRONICS, CL.HIGH]]))
            },
            {
                onApply: () => {
                    if (this.planet.c.relationships.get(this.targetPlanet) == RELATIONSHIP_TYPES.TENSE) {
                        this.planet.c.relationships.set(this.targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
                    }
                }
            }
        )

        this.addTargetPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.TENSE,
                economy: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH], [CARGO_TYPES.WEAPONS, CL.HIGH], [CARGO_TYPES.ELECTRONICS, CL.HIGH]]))
            },
            {
                onApply: () => {
                    if (this.targetPlanet.c.relationships.get(this.planet) == RELATIONSHIP_TYPES.TENSE) {
                        this.targetPlanet.c.relationships.set(this.planet, RELATIONSHIP_TYPES.NEUTRAL)
                    }
                }
            }
        )

        this.cancelEffects = this.completeEffects.map(effect => effect.clone())
    }

    shouldCancel() {
        return !Civilization.areTense(this.planet, this.targetPlanet)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Must be the top 2 economic powers
        const allPlanets = [...gs.system.planets, ...gs.system.dwarfPlanets].filter(planet => planet.civilization)
        const sortedByEconomy = allPlanets.sort((a, b) => b.c.economy - a.c.economy)
        const isTopTwoEconomies = sortedByEconomy.length >= 2 && 
            (sortedByEconomy[0] === p && sortedByEconomy[1] === tp) ||
            (sortedByEconomy[0] === tp && sortedByEconomy[1] === p)

        // Power balance check
        const powerRatio = p.c.military / tp.c.military
        const powerValid = powerRatio < CL.VERY_HIGH && powerRatio > CL.VERY_LOW

        const relationshipValid = Civilization.areNeutral(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.TENSIONS_ECONOMIC, NT.TENSIONS, ...NT_COOPERATIVE])
        
        return isTopTwoEconomies && powerValid && relationshipValid && !interferingEvent
    }

    isValidEnd() {
        const {planet: p, targetPlanet: tp} = this
        // Can only end if planets are not actively at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        return relationshipsValid
    }
}
