class WarFalseFlagNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches a false flag ground invasion of ${coloredName(targetPlanet)}, blaming it on third parties!`,
            `Peace treaty signed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            '',
            `War between ${coloredName(planet)} and ${coloredName(targetPlanet)} is called off prematurely!`,
            NT.WAR_FALSE_FLAG, planet, targetPlanet
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
                }
            }
        )

        this.addTargetPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.WAR,
                army: CL.VERY_LOW,
                territory: CL.LOW,
                wealth: CL.LOW,
                reserves: CL.LOW,
                prestige: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WEAPONS, 2],
                    [CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_HIGH],
                    [CARGO_TYPES.FOOD, CL.HIGH],
                    [CARGO_TYPES.MEDICINE, CL.HIGH]
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
        // Must have higher prestige (for false flag to work)
        const prestigeValid = p.c.prestige > tp.c.prestige && p.c.prestige > CL.MEDIUM
        // Must have strong army to invade
        const armyValid = p.c.army > CL.MEDIUM && p.c.military > CL.SLIGHTLY_LOW
        // Target must have territory worth taking
        const territoryValid = tp.c.territory > CL.SLIGHTLY_LOW
        // Can be neutral or tense (false flag can start war)
        const relationshipValid = Civilization.areNeutral(p, tp) || Civilization.areTense(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [...NT_COOPERATIVE, NT.WAR, NT.WAR_SNEAK_ATTACK, NT.WAR_FALSE_FLAG])
        return prestigeValid && armyValid && territoryValid && relationshipValid && !interferingEvent
    }
}
