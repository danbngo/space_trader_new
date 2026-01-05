class MinorForcedDemilitarizationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} forces ${coloredName(targetPlanet)} to disarm through temporary military occupation!`,
            `${coloredName(planet)} withdraws its occupation forces from ${coloredName(targetPlanet)}, having successfully demilitarized them!`,
            ``,
            ``,
            NT.MINOR_FORCED_DEMILITARIZATION, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                navy: CL.LOW,
                army: CL.LOW,
                territory: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                navy: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
                territory: CL.HIGH,
                prestige: CL.HIGH,
            },
        )

        this.addTargetPlanetEffect(
            {
                army: CL.VERY_LOW,
                navy: CL.VERY_LOW,
                prestige: CL.LOW,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                army: CL.LOW,
                navy: CL.LOW,
                prestige: CL.LOW,
                culture: CL.HIGH,
            },
        )

        // Moderate culture transfer through occupation
        this.completeEffects[0].onApply = () => {
            if (this.planet instanceof Planet && this.targetPlanet instanceof Planet) {
                this.targetPlanet.addCulture(this.planet, 0.06)
            }
        }
    }

    shouldCancel() {
        return Civilization.areAllies(this.planet, this.targetPlanet) || Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        // This event always succeeds - overwhelming force ensures compliance
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Target must be neutral or subject
        const targetRelationship = tp.c.relationships.get(p)
        const relationshipValid = targetRelationship === RELATIONSHIP_TYPES.NEUTRAL || targetRelationship === RELATIONSHIP_TYPES.SUBJECT
        
        if (!relationshipValid) return false
        
        // If neutral, target must not be subject of another power
        if (targetRelationship === RELATIONSHIP_TYPES.NEUTRAL) {
            const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.moons]
            const hasOtherSovereign = allBodies.some(body => {
                if (body === p || body === tp || !body.c) return false
                return tp.c.relationships.get(body) === RELATIONSHIP_TYPES.SUBJECT
            })
            
            if (hasOtherSovereign) return false
        }
        
        // Planet must have overwhelming military superiority
        const militaryValid = p.c.army > tp.c.army * 2 && p.c.navy > tp.c.navy * 2
        
        // Target must have low prestige (vulnerable)
        const prestigeValid = tp.c.prestige < CL.MEDIUM
        
        // Target must have some military to disarm
        const targetMilitaryValid = tp.c.army > CL.SLIGHTLY_LOW || tp.c.navy > CL.SLIGHTLY_LOW
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.MINOR_FORCED_DEMILITARIZATION, NT.WAR, NT.BLOCKADE, NT.LAND_GRAB])
        
        return militaryValid && prestigeValid && targetMilitaryValid && !interferingEvent
    }
}
