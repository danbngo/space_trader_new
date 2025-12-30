class DepressionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s tenuous economy plunges into a Great Depression!`,
            `${coloredName(planet)} proactively mitigates its Depression, putting the populace to work!`,
            `${coloredName(planet)}'s economy is recovering sluggishly after allowing the Depression to reign unchecked!`,
            '',
            NT.DEPRESSION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    inflation: CL.EXTREMELY_LOW,
                    reserves: CL.EXTREMELY_LOW,
                    economy: CL.EXTREMELY_LOW,
                    industry: CL.VERY_LOW,
                    wealth: CL.EXTREMELY_LOW,
                    crime: CL.HIGH,
                    education: CL.LOW, // workforce quality drops
                    taxes: CL.HIGH
                })
                //crime: 0.7, -recession-proof industry
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())

        //some lingering price rate, cargo, commercial, and credit rate decreases
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            inflation: CL.EXTREMELY_LOW,
            wealth: CL.LOW,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            inflation: CL.EXTREMELY_LOW,
            reserves: CL.LOW,
            economy: CL.LOW,
            industry: CL.LOW,
            wealth: CL.EXTREMELY_LOW,
            crime: CL.HIGH,
            education: CL.LOW,
        }))
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher industry and prestige = more likely to recover
        this.rollOutcome((p.c.industry + p.c.economy + p.c.reserves + p.c.taxes) / 4, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        //more likely to happen when credit is REALLY high
        const ratingsValid = (p.c.wealth) > CL.VERY_HIGH && p.c.economy < CL.HIGH
        const interferingEvent =News.planetHasAnyNews(p, NT_ECONOMY_BOOSTING) || News.planetHasAnyNewsTargeting(p, NT_ECONOMY_BOOSTING)
        return ratingsValid && !interferingEvent
    }
}
