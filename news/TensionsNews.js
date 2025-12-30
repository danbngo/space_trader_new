class TensionsNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Tensions rise between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Tensions cease between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            '',
            `Tensions between ${coloredName(planet)} and ${coloredName(targetPlanet)} de-escalate suddenly!`,
            NT.TENSIONS, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.TENSE,
                army: CL.SLIGHTLY_HIGH,
                navy: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH]]),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.TENSE,
                army: CL.SLIGHTLY_HIGH,
                navy: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        for (const fx of this.completeEffects) {
            fx.onApply = ()=>{
                if (planet.c.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.TENSE) planet.c.relationships.set(targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
            }
        }

        this.cancelEffects = this.completeEffects.map(effect => effect.clone())
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if relationships improved (became allies) or escalated to war
        const currentRel1 = planet.c.relationships.get(targetPlanet)
        const currentRel2 = targetPlanet.c.relationships.get(planet)
        this.cancelled = (currentRel1 === RELATIONSHIP_TYPES.ALLY || currentRel2 === RELATIONSHIP_TYPES.ALLY || 
                         currentRel1 === RELATIONSHIP_TYPES.WAR || currentRel2 === RELATIONSHIP_TYPES.WAR)
    }

    isValid(ignorePolitics = false) {
        const {planet: p, targetPlanet: tp} = this
        //cant have same government type or be a puppet
        const governmentsValid = planet.c.governmentType != targetPlanet.c.governmentType

        //there generally won't be beef if the power disparity is too large
        const powerRatio = planet.c.military / targetPlanet.c.military
        const powerValid = powerRatio < CL.VERY_HIGH && powerRatio > CL.VERY_LOW

        const relationshipValid = planet.c.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.NEUTRAL && targetPlanet.c.relationships.get(planet) == RELATIONSHIP_TYPES.NEUTRAL
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.TENSIONS, ...NT_COOPERATIVE])
        return (powerValid) && (governmentsValid) && relationshipValid && !interferingEvent
    }

    isValidEnd() {
        const {planet: p, targetPlanet: tp} = this
        //can only end if planets are not actively at war
        const relationshipsValid = planet.c.relationships.get(targetPlanet) != RELATIONSHIP_TYPES.WAR && targetPlanet.c.relationships.get(planet) != RELATIONSHIP_TYPES.WAR
        return relationshipsValid
    }
}
