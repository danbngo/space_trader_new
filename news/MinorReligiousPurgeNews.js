class MinorReligiousPurgeNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends ${colorSpan(planet.c.stateReligion?.name || 'religious', planet.c.stateReligion?.color || COLORS.White)} agents to ${coloredName(targetPlanet)} to erase other faiths, burn books, and rewrite history!`,
            `${coloredName(planet)}'s religious purge of ${coloredName(targetPlanet)} succeeds, erasing rival faiths and imposing ${colorSpan(planet.c.stateReligion?.name || 'their religion', planet.c.stateReligion?.color || COLORS.White)}!`,
            `${coloredName(targetPlanet)}'s cultural resistance thwarts ${coloredName(planet)}'s religious purge, preserving their spiritual heritage!`,
            ``,
            NT.MINOR_RELIGIOUS_PURGE, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                security: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.LOW,
            },
        )

        this.addTargetPlanetEffect(
            {
                culture: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW,
            },
            {
                culture: CL.LOW,
                prestige: CL.LOW,
            },
            {
                culture: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            },
        )

        // Strong culture transfer through religious purge
        this.startEffects[0].onApply = () => {
            if (this.planet instanceof Planet && this.targetPlanet instanceof Planet) {
                this.targetPlanet.addCulture(this.planet, 0.06)
                
                // Spread planet's state religion
                if (this.planet.c.stateReligion && this.targetPlanet.c.religions) {
                    const currentAmount = this.targetPlanet.c.religions.getAmount(this.planet.c.stateReligion) || 0
                    this.targetPlanet.c.religions.setAmount(this.planet.c.stateReligion, currentAmount + 0.10)
                    this.targetPlanet.c.religions.normalize()
                }
            }
        }
        
        this.completeEffects[0].onApply = () => {
            if (this.planet instanceof Planet && this.targetPlanet instanceof Planet) {
                this.targetPlanet.addCulture(this.planet, 0.10)
                
                // Further spread planet's state religion on success
                if (this.planet.c.stateReligion && this.targetPlanet.c.religions) {
                    const currentAmount = this.targetPlanet.c.religions.getAmount(this.planet.c.stateReligion) || 0
                    this.targetPlanet.c.religions.setAmount(this.planet.c.stateReligion, currentAmount + 0.15)
                    this.targetPlanet.c.religions.normalize()
                }
            }
        }
    }

    shouldCancel() {
        return Civilization.areAtWar(this.planet, this.targetPlanet) || 
               !this.planet.c.stateReligion || 
               this.planet.c.stateReligion === this.targetPlanet.c.stateReligion
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        
        // Planet's ability to conduct religious purge
        const aggressorScore = (p.c.security * p.c.culture * p.c.prestige) * p.objectType.powerMultiplier
        
        // Target's cultural resistance
        const victimScore = (tp.c.culture * tp.c.education * tp.c.security) * tp.objectType.powerMultiplier
        
        this.rollOutcome(aggressorScore / victimScore, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Planet must have a state religion
        if (!p.c.stateReligion) return false
        
        // Must have different state religions
        const religionValid = p.c.stateReligion !== tp.c.stateReligion
        
        // Target must not be subject of any other planet
        const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.moons]
        const isSubjectOfOther = allBodies.some(body => {
            if (body === p || body === tp || !body.c) return false
            return tp.c.relationships.get(body) === RELATIONSHIP_TYPES.SUBJECT
        })
        
        if (isSubjectOfOther) return false
        
        // Planet must have security and cultural strength for purge
        const planetValid = p.c.security > CL.MEDIUM && p.c.culture > CL.MEDIUM
        
        // Cannot be at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.MINOR_RELIGIOUS_PURGE, NT.RELIGION_INQUISITION, NT.RELIGION_PROSELYTIZE])
        
        return religionValid && planetValid && relationshipsValid && !interferingEvent
    }
}
