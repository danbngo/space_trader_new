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
                military: CL.VERY_LOW,
                territory: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW], [CARGO_TYPES.WEAPONS, CL.EXTREMELY_LOW]]),
                blackMarketCargoAmounts: CL.SLIGHTLY_LOW,
                shipyardNumShips: CL.VERY_LOW,
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            military: CL.NO_REGRESSION, 
            territory: CL.NO_REGRESSION,
            shipyardNumShips: CL.NO_REGRESSION,
            economy: CL.SLIGHTLY_HIGH, //small bonuses to the economy
            industry: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH,
        })

        // Failed: forced to rearm, economic benefits lost
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                military: CL.NO_REGRESSION, // stayed weak
                shipyardNumShips: CL.NO_REGRESSION,
                territory: CL.NO_REGRESSION,
                prestige: CL.LOW, // seen as weak
            })
        ]
    }

    determineEnding() {
        const {planet} = this
        // Disarmament fails if tensions arise
        let tensionsDetected = false
        for (const p of gs.system.planets) {
            if (p !== planet) {
                const rel = p.culture.relationships.get(planet)
                if (rel === RELATIONSHIP_TYPES.TENSE || rel === RELATIONSHIP_TYPES.WAR) {
                    tensionsDetected = true
                    break
                }
            }
        }
        this.failed = tensionsDetected
    }

    isValid() {
        const {planet} = this
        //unlikely if planet has a low military already
        const ratingsValid = (planet.culture.military > CL.HIGH) && (planet.navy > CL.HIGH)
        const interferingEvent =
            News.planetHasAnyNewsTargeting(planet, NT_MARTIAL) ||
            News.planetHasAnyNews(planet, NT_MARTIAL)
        return ratingsValid && !interferingEvent
    }
}
