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
                military: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH]]),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.TENSE,
                military: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        for (const fx of this.completeEffects) {
            fx.onApply = ()=>{
                if (planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.TENSE) planet.culture.relationships.set(targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
            }
        }

        this.cancelEffects = this.completeEffects.map(effect => effect.clone())
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if relationships improved (became allies) or escalated to war
        const currentRel1 = planet.culture.relationships.get(targetPlanet)
        const currentRel2 = targetPlanet.culture.relationships.get(planet)
        this.cancelled = (currentRel1 === RELATIONSHIP_TYPES.ALLY || currentRel2 === RELATIONSHIP_TYPES.ALLY || 
                         currentRel1 === RELATIONSHIP_TYPES.WAR || currentRel2 === RELATIONSHIP_TYPES.WAR)
    }

    isValid(ignorePolitics = false) {
        const {planet, targetPlanet} = this
        //cant have same government type or be a puppet
        const governmentsValid = planet.culture.governmentType != targetPlanet.culture.governmentType

        //there generally won't be beef if the power disparity is too large
        const powerRatio = planet.culture.military / targetPlanet.culture.military
        const powerValid = powerRatio < CL.VERY_HIGH && powerRatio > CL.VERY_LOW

        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.NEUTRAL && targetPlanet.culture.relationships.get(planet) == RELATIONSHIP_TYPES.NEUTRAL
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.TENSIONS, ...NT_COOPERATIVE])
        return (powerValid) && (governmentsValid) && relationshipValid && !interferingEvent
    }

    isValidEnd() {
        const {planet, targetPlanet} = this
        //can only end if planets are not actively at war
        const relationshipsValid = planet.culture.relationships.get(targetPlanet) != RELATIONSHIP_TYPES.WAR && targetPlanet.culture.relationships.get(planet) != RELATIONSHIP_TYPES.WAR
        return relationshipsValid
    }
}
