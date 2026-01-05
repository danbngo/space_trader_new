class ProxyWarNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} provides military and material support to ${coloredName(targetPlanet)} in their ongoing conflict!`,
            `${coloredName(planet)} ends its military support to ${coloredName(targetPlanet)}!`,
            '',
            `${coloredName(planet)}'s support for ${coloredName(targetPlanet)} is suspended!`,
            NT.PROXY_WAR, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                taxes: CL.HIGH,
                reserves: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WEAPONS, CL.VERY_HIGH],
                    [CARGO_TYPES.ANTIMATTER, CL.HIGH]
                ]))
            },
            {
                // End effect minimal
            }
        )

        this.addTargetPlanetEffect(
            {
                army: CL.SLIGHTLY_HIGH,
                navy: CL.SLIGHTLY_HIGH,
                reserves: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                taxes: CL.LOW,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                // End effect minimal
            }
        )

        this.cancelEffects = this.completeEffects.map(effect => effect.clone())
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if target planet is no longer at war
        const targetAtWar = Civilization.getPlanetsAtWarWith(tp).length > 0
        if (!targetAtWar) return true
        
        // Cancel if planet and target become hostile
        if (Civilization.areTenseOrAtWar(p, tp)) return true
        
        return false
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Target must be at war with someone
        const enemyPlanets = Civilization.getPlanetsAtWarWith(tp)
        if (enemyPlanets.length === 0) return false
        
        // Planet must be tense with at least one of target's enemies (proxy war logic)
        const hasCommonEnemy = enemyPlanets.some(enemy => Civilization.areTenseOrAtWar(p, enemy))
        if (!hasCommonEnemy) return false
        
        // Must have resources to support
        const resourcesValid = p.c.wealth > CL.MEDIUM && p.c.reserves > CL.SLIGHTLY_LOW
        
        // Must be neutral or allied with target (not tense)
        const relationshipValid = (Civilization.areNeutral(p, tp) || Civilization.areAllies(p, tp)) && !Civilization.areTense(p, tp)
        
        // Can't already be supporting them or at war with them
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.PROXY_WAR]) || Civilization.areAtWar(p, tp)
        
        return hasCommonEnemy && resourcesValid && relationshipValid && !interferingEvent
    }
}
