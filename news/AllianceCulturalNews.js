class AllianceCulturalNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Cultural alliance formed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Cultural alliance dissolved between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            ``,
            `Tensions between ${coloredName(planet)} and ${coloredName(targetPlanet)} interfere with their cultural alliance!`,
            NT.ALLIANCE_CULTURAL, planet, targetPlanet
        )

        this.addPlanetEffect({
            newRelationship: RELATIONSHIP_TYPES.ALLY,
            security: CL.SLIGHTLY_HIGH,
            culture: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            army: CL.SLIGHTLY_HIGH,
            navy: CL.SLIGHTLY_HIGH,
            cargoPriceMultipliers: new CountsMap(new Map([
                [CARGO_TYPES.HOLOCUBES, CL.SLIGHTLY_LOW]
            ]))
        })

        this.addTargetPlanetEffect({
            newRelationship: RELATIONSHIP_TYPES.ALLY,
            security: CL.SLIGHTLY_HIGH,
            culture: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            army: CL.SLIGHTLY_HIGH,
            navy: CL.SLIGHTLY_HIGH
        })

        this.completeEffects[0].onApply = ()=>{
            if (this.planet.c.relationships.get(this.targetPlanet) == RELATIONSHIP_TYPES.ALLY) {
                this.planet.c.relationships.set(this.targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
            }
            if (this.targetPlanet.c.relationships.get(this.planet) == RELATIONSHIP_TYPES.ALLY) {
                this.targetPlanet.c.relationships.set(this.planet, RELATIONSHIP_TYPES.NEUTRAL)
            }
        }
    }

    determineOutcome() {
        if (Civilization.areTenseOrAtWar(this.planet, this.targetPlanet)) {
            this.cancelled = true
        }
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Must have same majority culture
        const pMajorityCulture = p.c.cultures?.calcHighestKey()
        const tpMajorityCulture = tp.c.cultures?.calcHighestKey()
        const sameMajorityCulture = pMajorityCulture && tpMajorityCulture && pMajorityCulture === tpMajorityCulture
        
        // Both planets must be currently neutral towards each other
        const relationships = [p.c.relationships.get(tp), tp.c.relationships.get(p)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL)
        
        const opposingGovernmentsValid = !Civilization.areOpposingGovernments(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        
        return sameMajorityCulture && opposingGovernmentsValid && relationshipsValid && !interferingEvent
    }
}
