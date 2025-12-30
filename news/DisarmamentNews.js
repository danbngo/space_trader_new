class DisarmamentNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} seeks system-wide peace and begins a period of disarmament!`,
            `${coloredName(planet)}'s disarmament period comes to an end!`,
            ``,
            `External threats force ${coloredName(planet)} to abandon disarmament prematurely!`,
            NT.DISARMAMENT, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    army: CL.LOW,
                    navy: CL.LOW,
                    territory: CL.SLIGHTLY_LOW,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW], [CARGO_TYPES.WEAPONS, CL.EXTREMELY_LOW]])),
                })
            })
        ]

        //system becomes more crowded over time...
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            army: CL.VERY_LOW, 
            navy: CL.VERY_LOW,
            territory: CL.SLIGHTLY_LOW,
            economy: CL.SLIGHTLY_HIGH, //small bonuses to the economy
            industry: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            taxes: CL.VERY_LOW
        }))

        this.failEffects = this.failEffects.map(effect => effect.getInverse())
        // Failed: forced to rearm, economic benefits lost
        this.cancelEffects = this.cancelEffects.map(effect => effect.getInverse())
    }

    shouldCancel() {
        const {planet: p} = this
        const interferingEvent = News.planetHasAnyNewsTargeting(p, NT_MARTIAL) || News.planetHasAnyNews(p, NT_MARTIAL)
        return interferingEvent !== null && interferingEvent !== undefined
    }

    isValid() {
        const {planet: p} = this
        //unlikely if planet has a low military already
        const ratingsValid = (p.c.army > CL.HIGH) && (p.c.navy > CL.HIGH)
        //you cant be at war
        const interferingEvent = News.planetHasAnyNewsTargeting(p, NT_MARTIAL) || News.planetHasAnyNews(p, NT_MARTIAL)
        return ratingsValid && !interferingEvent
    }
}
