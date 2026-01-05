class MinorMissileCrisisNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} discovers that ${coloredName(targetPlanet)} is hosting missiles from a rival power, sparking a tense standoff!`,
            `${coloredName(planet)}'s brinksmanship succeeds - ${coloredName(targetPlanet)} removes the missiles under pressure!`,
            `${coloredName(planet)} backs down, allowing ${coloredName(targetPlanet)} to keep the missiles, diminishing their influence!`,
            ``,
            NT.MINOR_MISSILE_CRISIS, planet, targetPlanet
        )

        this.thirdPartyPlanet = null // Will be set in isValid

        this.addPlanetEffect(
            {
                prestige: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH]])),
            },
            {
                prestige: CL.VERY_HIGH,
                territory: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_LOW]])), // Invert temporary price increase
            },
            {
                prestige: CL.LOW,
                territory: CL.SLIGHTLY_LOW,
                navy: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_LOW]])), // Invert temporary price increase
            },
        )

        this.addTargetPlanetEffect(
            {
                prestige: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.LOW,
                security: CL.SLIGHTLY_LOW,
            },
            {
                prestige: CL.SLIGHTLY_HIGH,
            },
        )

        // Cancel effects should also remove cargo price modifiers
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_LOW]])), // Invert temporary price increase
            })
        ]
    }

    shouldCancel() {
        return Civilization.areAllies(this.planet, this.targetPlanet) || !this.thirdPartyPlanet
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Success through brinksmanship - prestige, navy, and determination
        const aggressorScore = (p.c.prestige * p.c.navy * p.c.army) * p.objectType.powerMultiplier
        const victimScore = (tp.c.prestige * tp.c.security) * tp.objectType.powerMultiplier
        this.rollOutcome(aggressorScore / victimScore, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Find a third party planet that targetPlanet is allied/subject to
        const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.moons]
        const potentialThirdParties = allBodies.filter(body => {
            if (body === p || body === tp || !body.c) return false
            if (body.objectType !== p.objectType) return false // Same object type as aggressor
            const tpRelationship = tp.c.relationships.get(body)
            return tpRelationship === RELATIONSHIP_TYPES.ALLY || tpRelationship === RELATIONSHIP_TYPES.SUBJECT
        })
        
        if (potentialThirdParties.length === 0) return false
        
        this.thirdPartyPlanet = rndMember(potentialThirdParties)
        
        // Planet must be tense or hostile with third party
        const relationshipWithThird = p.c.relationships.get(this.thirdPartyPlanet)
        const relationshipsValid = relationshipWithThird === RELATIONSHIP_TYPES.TENSE || relationshipWithThird === RELATIONSHIP_TYPES.WAR
        
        // Target must not be at war with planet
        const targetRelationshipValid = !Civilization.areAtWar(p, tp)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_MARTIAL)
        
        return relationshipsValid && targetRelationshipValid && !interferingEvent
    }
}
