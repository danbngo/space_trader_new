class WarAllyNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet(), allyPlanet = new Planet()) {
        super(
            `${coloredName(planet)} beings diplomatic efforts to convince its allies to join the fight against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s diplomatic efforts lead to other planets joining the fight against ${coloredName(targetPlanet)}!`,
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
        Object.assign(this.endEffects[2], {
            prestige: CL.LOW,
        })
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
