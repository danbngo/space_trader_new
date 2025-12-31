class WarAllyNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins diplomatic efforts to convince its allies to join the fight against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s diplomatic efforts lead to its allies joining the fight against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s diplomatic efforts fail to secure its allies' commitment in the fight against ${coloredName(targetPlanet)}!`,
            `Peace between ${coloredName(planet)} and ${coloredName(targetPlanet)} renders alliance negotiations moot!`,
            NT.WAR_ALLY, planet, targetPlanet
        )
        
        this.addPlanetEffect(
            {
                planet: this.planet
            },
            {
                prestige: CL.NO_REGRESSION
            },
            {
                prestige: CL.LOW
            },
            {
                prestige: CL.SLIGHTLY_LOW
            }
        )
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if war no longer ongoing
        return p.c.relationships.get(tp) !== RELATIONSHIP_TYPES.WAR
    }

    determineOutcome() {
        const {planet: p} = this
        // Success probability based on prestige
        this.rollOutcome(p.c.prestige * 0.7 + 0.2)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = p.c.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        
        // Find potential allies
        const potentialAllies = PLANETS.filter(p => {
            if (p === planet || p === targetPlanet) return false
            if (p.c.governmentType === GT.PUPPET_STATE) return false
            const relWithPlanet = p.c.relationships.get(planet)
            const relWithTarget = p.c.relationships.get(targetPlanet)
            return relWithPlanet === RELATIONSHIP_TYPES.ALLY && 
                   (relWithTarget === RELATIONSHIP_TYPES.NEUTRAL || relWithTarget === RELATIONSHIP_TYPES.TENSE)
        })
        
        if (potentialAllies.length === 0) return false
        
        // Set ally planet for this instance
        this.allyPlanet = rndMember(potentialAllies)
        
        // Must have high prestige to convince allies
        const prestigeValid = p.c.prestige > CL.HIGH
        // Can't have ally recruitment already
        const interferingEvent = News.hasNews(NT.WAR_ALLY, planet, targetPlanet)
        return relationshipValid && hasWar && prestigeValid && !interferingEvent
    }
}
