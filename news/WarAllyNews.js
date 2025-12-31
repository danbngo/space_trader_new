class WarAllyNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins diplomatic efforts to convince its allies to join the fight against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s diplomatic efforts lead to its allies joining the fight against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s diplomatic efforts fail to secure its allies' commitment in the fight against ${coloredName(targetPlanet)}!`,
            `Peace between ${coloredName(planet)} and ${coloredName(targetPlanet)} renders alliance negotiations moot!`,
            NT.WAR_ALLY, planet, targetPlanet
        )
        
        this.addPlanetEffect({},
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
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {planet: p} = this
        // Success probability based on prestige
        this.rollOutcome(p.c.prestige * 0.7 + 0.2)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipsValid = Civilization.areAtWar(p, tp)
        
        // Find potential allies
        const potentialAllies = PLANETS.filter(ap => {
            if (ap === p || ap === tp) return false
            if (ap.c.governmentType === GT.PUPPET_STATE) return false
            if (News.planetHasAnyNews(ap, NT_GOVERNANCE_PREVENTING)) return false
            if (!Civilization.areAllies(ap, p)) return false
            return true
        })
        
        if (potentialAllies.length === 0) return false
        
        // Set ally planet for this instance
        this.allyPlanet = rndMember(potentialAllies)
        
        // Must have high prestige to convince allies
        const prestigeValid = p.c.prestige > CL.HIGH
        // Can't have ally recruitment already
        const interferingEvent = News.hasNews(NT.WAR_ALLY, p, tp)
        return relationshipsValid && prestigeValid && !interferingEvent
    }
}
