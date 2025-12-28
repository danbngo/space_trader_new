class WarAllyNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet(), allyPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins diplomatic efforts to convince its allies to join the fight against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s diplomatic efforts lead to ${coloredName(allyPlanet)} joining the fight against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s diplomatic efforts fail to secure ${coloredName(allyPlanet)}'s commitment!`,
            `Peace between ${coloredName(planet)} and ${coloredName(targetPlanet)} renders alliance negotiations moot!`,
            NT.WAR_ALLY, planet, targetPlanet
        )
        
        this.allyPlanet = allyPlanet

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                prestige: CL.LOW, // cost of diplomacy
            }),
            new NewsEffect({
                planet: this.allyPlanet,
                targetPlanet: this.targetPlanet,
            }),
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Original instigator: prestige cost is permanent
        Object.assign(this.endEffects[0], {
            prestige: CL.NO_REGRESSION,
        })
        // Ally and target declare war
        Object.assign(this.endEffects[1], {
            newRelationship: RELATIONSHIP_TYPES.WAR,
        })

        // Failed: diplomatic effort rebuffed, no ally joins
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                prestige: CL.LOW, // diplomatic failure
            })
        ]

        // Cancelled: peace declared before ally commits
        this.cancelEndEffects = [
            new NewsEffect({
                planet: this.planet,
                prestige: News.clHalfRegression(CL.LOW), // partial prestige recovery
            })
        ]
    }

    determineEnding() {
        const {planet, targetPlanet, allyPlanet} = this
        // Check if war still ongoing
        const stillAtWar = planet.culture.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        if (!stillAtWar) {
            this.cancelled = true
            return
        }
        // Success probability based on prestige and ally relationship
        const successProbability = planet.culture.prestige * 0.7 + 0.2
        this.failed = Math.random() > successProbability
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Must be at war
        const relationshipValid = planet.culture.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        
        // Find potential allies
        const potentialAllies = PLANETS.filter(p => {
            if (p === planet || p === targetPlanet) return false
            if (p.culture.governmentType === GT.PUPPET_STATE) return false
            const relWithPlanet = p.culture.relationships.get(planet)
            const relWithTarget = p.culture.relationships.get(targetPlanet)
            return relWithPlanet === RELATIONSHIP_TYPES.ALLY && 
                   (relWithTarget === RELATIONSHIP_TYPES.NEUTRAL || relWithTarget === RELATIONSHIP_TYPES.TENSE)
        })
        
        if (potentialAllies.length === 0) return false
        
        // Set ally planet for this instance
        this.allyPlanet = rndMember(potentialAllies)
        
        // Must have high prestige to convince allies
        const prestigeValid = planet.culture.prestige > CL.HIGH
        // Can't have ally recruitment already
        const interferingEvent = News.hasNews(NT.WAR_ALLY, planet, targetPlanet)
        return relationshipValid && hasWar && prestigeValid && !interferingEvent
    }
}
