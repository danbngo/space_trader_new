class AnnexationReferendumNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `A referendum is held in ${coloredName(targetPlanet)} - citizens vote to leave their current sovereign and join ${coloredName(planet)} based on shared cultural ties!`,
            `${coloredName(planet)} successfully annexes ${coloredName(targetPlanet)} through the referendum, establishing a new subject relationship!`,
            `${coloredName(targetPlanet)}'s referendum is crushed by their current sovereign - the annexation attempt by ${coloredName(planet)} fails!`,
            ``,
            NT.ANNEXATION_REFERENDUM, planet, targetPlanet
        )

        this.currentSovereign = null // Will be set in isValid

        this.addPlanetEffect(
            {
                prestige: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
            },
            {
                prestige: CL.HIGH,
                territory: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.LOW,
            },
        )

        this.addTargetPlanetEffect(
            {
                prestige: CL.SLIGHTLY_LOW,
                army: CL.LOW,
            },
            {
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.LOW,
                army: CL.LOW,
            },
        )

        // Culture transfer on success
        this.completeEffects[0].onApply = () => {
            if (this.planet instanceof Planet && this.targetPlanet instanceof Planet) {
                this.targetPlanet.addCulture(this.planet, 0.1)
                
                // Change relationships - targetPlanet becomes subject of planet
                if (this.currentSovereign) {
                    // End old sovereign relationship
                    this.targetPlanet.c.relationships.set(this.currentSovereign, RELATIONSHIP_TYPES.NEUTRAL)
                    this.currentSovereign.c.relationships.set(this.targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
                    
                    // Establish new subject relationship
                    this.planet.c.relationships.set(this.targetPlanet, RELATIONSHIP_TYPES.SOVEREIGN)
                    this.targetPlanet.c.relationships.set(this.planet, RELATIONSHIP_TYPES.SUBJECT)
                }
            }
        }
    }

    shouldCancel() {
        // Cancel if relationships change
        if (!this.currentSovereign) return true
        const targetRel = this.targetPlanet.c.relationships.get(this.currentSovereign)
        return targetRel !== RELATIONSHIP_TYPES.SUBJECT || Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        
        // Planet's ability to support the referendum: culture match, prestige, and military backing
        const aggressorScore = (p.c.culture * p.c.prestige * p.c.army * p.c.navy) * p.objectType.powerMultiplier
        
        // Current sovereign's ability to crush the referendum
        const sovereignScore = (this.currentSovereign.c.prestige * this.currentSovereign.c.army * this.currentSovereign.c.navy) * this.currentSovereign.objectType.powerMultiplier
        
        this.rollOutcome(aggressorScore / sovereignScore, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Find targetPlanet's current sovereign
        const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.moons]
        const sovereign = allBodies.find(body => {
            if (body === p || body === tp || !body.c) return false
            return tp.c.relationships.get(body) === RELATIONSHIP_TYPES.SUBJECT
        })
        
        if (!sovereign) return false
        this.currentSovereign = sovereign
        
        // Target must not be planet's subject already
        if (tp.c.relationships.get(p) === RELATIONSHIP_TYPES.SUBJECT) return false
        
        // Check culture match - planet's culture must be 1st or 2nd highest on targetPlanet
        const sortedCultures = [...tp.c.cultures.counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(entry => entry[0])
        
        const cultureMatch = sortedCultures.includes(p)
        if (!cultureMatch) return false
        
        // Planet must have some cultural strength
        const cultureValid = p.c.culture > CL.MEDIUM
        
        // Cannot be at war
        const relationshipsValid = !Civilization.areAtWar(p, tp) && !Civilization.areAtWar(p, sovereign)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.ANNEXATION_REFERENDUM, NT.LAND_GRAB, NT.WAR])
        
        return cultureValid && relationshipsValid && !interferingEvent
    }
}
