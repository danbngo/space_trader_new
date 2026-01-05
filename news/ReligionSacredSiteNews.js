class ReligionSacredSiteNews extends News {
    constructor(planet = new Planet()) {
        super(
            `A holy site on ${coloredName(planet)} has become sacred to ${colorSpan('a major religion', COLORS.White)} - pilgrims are flocking from across the system!`,
            `${coloredName(planet)}'s sacred site is successfully designated as neutral ground - pilgrims continue to visit in peace!`,
            `Squabbling between rival planets over claims to ${coloredName(planet)}'s sacred site diminishes its spiritual significance!`,
            ``,
            NT.RELIGION_SACRED_SITE, planet
        )

        this.chosenReligion = null // Will be set in constructor after choosing from system religions

        this.addPlanetEffect(
            {
                culture: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                taxes: CL.LOW,
            },
            {
                culture: CL.HIGH,
                wealth: CL.HIGH,
                prestige: CL.HIGH,
                taxes: CL.LOW,
            },
            {
                culture: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW,
                taxes: CL.SLIGHTLY_LOW,
            },
        )

        // Choose a major religion from the system
        this.selectReligion()
        
        // Update display text with chosen religion
        if (this.chosenReligion) {
            this.startedName = this.startedName.replace(
                colorSpan('a major religion', COLORS.White),
                coloredName(this.chosenReligion)
            )
        }
    }

    selectReligion() {
        // Find all religions present in the system
        const systemReligions = new Map()
        const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.moons]
        
        for (const body of allBodies) {
            if (!body.c || !body.c.religions) continue
            
            for (const [religion, amount] of body.c.religions.counts.entries()) {
                if (amount > 0.01) { // Only count significant presence
                    const current = systemReligions.get(religion) || 0
                    systemReligions.set(religion, current + amount * body.c.population)
                }
            }
        }
        
        // Choose the most widespread religion (or random if none found)
        if (systemReligions.size > 0) {
            const sortedReligions = [...systemReligions.entries()]
                .sort((a, b) => b[1] - a[1])
            this.chosenReligion = sortedReligions[0][0]
        }
    }

    shouldCancel() {
        // Cancel if planet undergoes major upheaval
        return this.planet.c.prestige < CL.VERY_LOW || this.planet.c.culture < CL.VERY_LOW
    }

    determineOutcome() {
        const {planet: p} = this
        
        // Success based on prestige and culture - can the planet maintain neutral ground?
        const successScore = p.c.prestige * p.c.culture * p.c.security
        
        this.rollOutcome(successScore, CL.LOW)
    }

    isValid() {
        const {planet: p} = this
        
        // Planet must have some religious presence
        const hasReligion = p.c.religions && p.c.religions.counts.size > 0
        
        // Planet must have culture and prestige to host pilgrims
        const planetValid = p.c.culture > CL.SLIGHTLY_LOW && p.c.prestige > CL.SLIGHTLY_LOW
        
        // Must have at least one religion present in the system
        const systemHasReligions = this.chosenReligion !== null
        
        return hasReligion && planetValid && systemHasReligions
    }
}
