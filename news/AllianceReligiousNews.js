class AllianceReligiousNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Religious alliance formed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Religious alliance dissolved between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            ``,
            `Tensions between ${coloredName(planet)} and ${coloredName(targetPlanet)} prevent religious alliance formation!`,
            NT.ALLIANCE_RELIGIOUS, planet, targetPlanet
        )

        this.addPlanetEffect({
            newRelationship: RELATIONSHIP_TYPES.ALLY,
            security: CL.SLIGHTLY_HIGH,
            culture: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            army: CL.SLIGHTLY_HIGH,
            navy: CL.SLIGHTLY_HIGH
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
        
        // Must have same state religion policy
        const hasStateReligionPolicy = (planet) => {
            return planet.c.policies.all.some(policy => policy === PT.STATE_RELIGION)
        }
        const bothHaveStateReligion = hasStateReligionPolicy(p) && hasStateReligionPolicy(tp)
        
        // Must have same majority religion
        const pMajorityReligion = p.c.religions?.calcHighestValue()
        const tpMajorityReligion = tp.c.religions?.calcHighestValue()
        const sameMajorityReligion = pMajorityReligion && tpMajorityReligion && pMajorityReligion === tpMajorityReligion
        
        // Both planets must be currently neutral towards each other
        const relationships = [p.c.relationships.get(tp), tp.c.relationships.get(p)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL)
        
        const opposingGovernmentsValid = !Civilization.areOpposingGovernments(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        
        return bothHaveStateReligion && sameMajorityReligion && opposingGovernmentsValid && relationshipsValid && !interferingEvent
    }
}
