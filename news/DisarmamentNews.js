class DisarmamentNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} seeks system-wide peace and begins a period of disarmament!`,
            `${coloredName(planet)}'s disarmament period comes to an end!`,
            `External threats force ${coloredName(planet)} to abandon disarmament prematurely!`,
            ``,
            NT.DISARMAMENT, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                army: CL.VERY_LOW,
                navy: CL.VERY_LOW,
                territory: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW], [CARGO_TYPES.WEAPONS, CL.EXTREMELY_LOW]])),
                crime: CL.SLIGHTLY_LOW,
            })
        ]

        //system becomes more crowded over time...
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[0], {
            army: CL.NO_REGRESSION, 
            navy: CL.NO_REGRESSION,
            territory: CL.NO_REGRESSION,
            economy: CL.SLIGHTLY_HIGH, //small bonuses to the economy
            industry: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH,
        })

        // Failed: forced to rearm, economic benefits lost
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                army: CL.NO_REGRESSION, // stayed weak
                navy: CL.NO_REGRESSION,
                territory: CL.NO_REGRESSION,
                prestige: CL.LOW, // seen as weak
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Disarmament fails if tensions arise
        let tensionsDetected = false
        for (const p of gs.system.planets) {
            if (p !== planet) {
                const rel = p.c.relationships.get(planet)
                if (rel === RELATIONSHIP_TYPES.TENSE || rel === RELATIONSHIP_TYPES.WAR) {
                    tensionsDetected = true
                    break
                }
            }
        }
        this.failed = tensionsDetected
    }

    isValid() {
        const {planet: p} = this
        //unlikely if planet has a low military already
        const ratingsValid = (planet.c.military > CL.HIGH) && (planet.c.navy > CL.HIGH)
        const interferingEvent =
            News.planetHasAnyNewsTargeting(planet, NT_MARTIAL) ||
            News.planetHasAnyNews(planet, NT_MARTIAL)
        return ratingsValid && !interferingEvent
    }
}
