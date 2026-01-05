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
        //planets tend not to want to go to war with stronger ones
        const ratingsValid = p.c.prestige > tp.c.prestige || (p.c.military > tp.c.military)
        //must not have same form of government
        const governmentsValid = (p.c.governmentType !== tp.c.governmentType)
        //must not be anarchic or a puppet state
        //planets must be hostile
        const relationshipValid = Civilization.areTense(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATIVE) || News.planetHasAnyNews(p, NT_GOVERNANCE_PREVENTING)
        return (ratingsValid) && (governmentsValid) && (relationshipValid) && !interferingEvent
    }
}
