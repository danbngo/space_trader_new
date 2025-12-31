class TensionsNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Tensions rise between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Tensions cease between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            '',
            `Tensions between ${coloredName(planet)} and ${coloredName(targetPlanet)} are swept aside by other events!`,
            NT.TENSIONS, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.TENSE,
                military: CL.SLIGHTLY_HIGH,
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
        //cant have same government type or be a puppet
        const governmentsValid = p.c.governmentType != tp.c.governmentType

        //there generally won't be beef if the power disparity is too large
        const powerRatio = p.c.military / tp.c.military
        const powerValid = powerRatio < CL.VERY_HIGH && powerRatio > CL.VERY_LOW

        const relationshipValid = Civilization.areNeutral(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.TENSIONS, ...NT_COOPERATIVE])
        return (powerValid) && (governmentsValid) && relationshipValid && !interferingEvent
    }

    isValidEnd() {
        const {planet: p, targetPlanet: tp} = this
        //can only end if planets are not actively at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        return relationshipsValid
    }
}
