class AllianceEthnicNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Ethnic alliance formed between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            `Ethnic alliance dissolved between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            ``,
            `Tensions between ${coloredName(planet)} and ${coloredName(targetPlanet)} interfere with their ethnic alliance!`,
            NT.ALLIANCE_ETHNIC, planet, targetPlanet
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
        
        // Must have same majority ethnicity/race
        const pMajorityRace = p.c.races?.calcHighestValue()
        const tpMajorityRace = tp.c.races?.calcHighestValue()
        const sameMajorityRace = pMajorityRace && tpMajorityRace && pMajorityRace === tpMajorityRace
        
        // Both planets must be currently neutral towards each other
        const relationships = [p.c.relationships.get(tp), tp.c.relationships.get(p)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL)
        
        const opposingGovernmentsValid = !Civilization.areOpposingGovernments(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        
        return sameMajorityRace && opposingGovernmentsValid && relationshipsValid && !interferingEvent
    }
}
