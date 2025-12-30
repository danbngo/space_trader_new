class ForeignAidNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s plight inspires other planets to send it foreign aid!`,
            `${coloredName(planet)}'s foreign aid finally dries up!`,
            `${coloredName(planet)} squanders foreign aid on corruption and mismanagement!`,
            ``,
            NT.FOREIGN_AID, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    inflation: CL.LOW,
                    reserves: CL.HIGH,
                    economy: CL.SLIGHTLY_HIGH,
                    industry: CL.SLIGHTLY_HIGH,
                    wealth: CL.HIGH,
                    navy: CL.SLIGHTLY_HIGH,
                    prestige: CL.SLIGHTLY_LOW,
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            inflation: CL.SLIGHTLY_LOW,
            reserves: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            wealth: CL.SLIGHTLY_HIGH,
            industry: CL.SLIGHTLY_HIGH,
            navy: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_LOW,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            prestige: CL.VERY_LOW,
            crime: CL.HIGH,
        }))
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.security)
    }

    isValid() {
        const {planet: p} = this
        //more likely to happen when economy is poor and has some prestige to burn
        const economyValid = p.c.economy < CL.LOW && p.c.industry < CL.LOW && p.c.wealth < CL.LOW
        const prestigeValid = p.c.prestige > CL.LOW
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.FOREIGN_AID, ...NT_ECONOMY_BOOSTING])
        return economyValid && prestigeValid && !interferingEvent
    }
}
