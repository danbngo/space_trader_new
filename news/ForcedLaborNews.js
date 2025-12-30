class ForcedLaborNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} implements brutal forced labor programs! Citizens are pressed into industrial work camps!`,
            `${coloredName(planet)}'s forced labor camps are finally dismantled!`,
            `Slave revolts force ${coloredName(planet)} to shut down labor camps!`,
            ``,
            NT.FORCED_LABOR, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    industry: CL.VERY_HIGH,
                    economy: CL.SLIGHTLY_LOW,
                    population: CL.LOW,
                    prestige: CL.LOW,
                    reserves: CL.HIGH,
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            industry: CL.SLIGHTLY_HIGH,
            population: CL.SLIGHTLY_LOW,
            reserves: CL.SLIGHTLY_HIGH,
            prestige: CL.LOW,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.VERY_LOW,
            economy: CL.LOW,
            prestige: CL.VERY_LOW,
            crime: CL.VERY_HIGH,
            army: CL.LOW,
        }))
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.security)
    }

    isValid() {
        const {planet: p} = this
        // More likely if industry is low (trying to industrialize)
        const ratingsValid = p.c.industry < CL.LOW
        // Authoritarian governments, police states, and communist states would do this
        const interferingEvent = News.planetHasAnyNews(planet, [NT.FORCED_LABOR])
        return ratingsValid && !interferingEvent
    }
}
