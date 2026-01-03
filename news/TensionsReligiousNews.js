class TensionsReligiousNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Religious tensions rise between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Religious tensions cease between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            '',
            `Religious tensions between ${coloredName(planet)} and ${coloredName(targetPlanet)} are swept aside by other events!`,
            NT.TENSIONS_RELIGIOUS, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.TENSE,
                military: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
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
                culture: CL.SLIGHTLY_HIGH,
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
        
        // Must have different state religions
        const hasStateReligionPolicy = (planet) => {
            return planet.c.policies.all.some(policy => policy === PT.STATE_RELIGION)
        }
        const differentStateReligions = hasStateReligionPolicy(p) && hasStateReligionPolicy(tp)
        
        // Must have different majority religions
        const pMajorityReligion = p.c.religions?.calcHighestKey()
        const tpMajorityReligion = tp.c.religions?.calcHighestKey()
        const differentMajorityReligions = pMajorityReligion && tpMajorityReligion && pMajorityReligion !== tpMajorityReligion

        // Power balance check
        const powerRatio = p.c.military / tp.c.military
        const powerValid = powerRatio < CL.VERY_HIGH && powerRatio > CL.VERY_LOW

        const relationshipValid = Civilization.areNeutral(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.TENSIONS_RELIGIOUS, NT.TENSIONS, ...NT_COOPERATIVE])
        
        return differentStateReligions && differentMajorityReligions && powerValid && relationshipValid && !interferingEvent
    }

    isValidEnd() {
        const {planet: p, targetPlanet: tp} = this
        // Can only end if planets are not actively at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        return relationshipsValid
    }
}
