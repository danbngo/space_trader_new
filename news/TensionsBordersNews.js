class TensionsBordersNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Border tensions rise between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Border tensions cease between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            '',
            `Border tensions between ${coloredName(planet)} and ${coloredName(targetPlanet)} are swept aside by other events!`,
            NT.TENSIONS_BORDERS, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.TENSE,
                military: CL.SLIGHTLY_HIGH,
                territory: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH], [CARGO_TYPES.WEAPONS, CL.HIGH]]))
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
                military: CL.SLIGHTLY_HIGH,
                territory: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH], [CARGO_TYPES.WEAPONS, CL.HIGH]]))
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
        
        // Both must have greater than low territory
        const territoryValid = p.c.territory > CL.LOW && tp.c.territory > CL.LOW
        
        // Must be close in orbital radius (within 20% difference)
        const pRadius = p.orbit?.radius || 0
        const tpRadius = tp.orbit?.radius || 0
        if (pRadius === 0 || tpRadius === 0) return false
        
        const radiusDifference = Math.abs(pRadius - tpRadius)
        const averageRadius = (pRadius + tpRadius) / 2
        const closeOrbits = (radiusDifference / averageRadius) < 0.2

        // Power balance check
        const powerRatio = p.c.military / tp.c.military
        const powerValid = powerRatio < CL.VERY_HIGH && powerRatio > CL.VERY_LOW

        const relationshipValid = Civilization.areNeutral(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.TENSIONS_BORDERS, NT.TENSIONS, ...NT_COOPERATIVE])
        
        return territoryValid && closeOrbits && powerValid && relationshipValid && !interferingEvent
    }

    isValidEnd() {
        const {planet: p, targetPlanet: tp} = this
        // Can only end if planets are not actively at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        return relationshipsValid
    }
}
