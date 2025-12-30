class OrganizedCrimeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is infiltrated by organized crime syndicates, corrupting the planet!`,
            `${coloredName(planet)} conducts high profile arrests and declares victory over the syndicates!`,
            `${coloredName(planet)}'s crackdown on organized crime fails as syndicates consolidate power!`,
            ``,
            NT.ORGANIZED_CRIME, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    economy: CL.LOW,
                    wealth: CL.LOW,
                    industry: CL.LOW,
                    security: CL.LOW,
                    crime: CL.VERY_HIGH,
                    corruption: CL.VERY_HIGH
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Some lingering corruption after
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            economy: CL.SLIGHTLY_LOW,
            wealth: CL.SLIGHTLY_LOW,
            industry: CL.SLIGHTLY_LOW,
            security: CL.SLIGHTLY_LOW,
            crime: CL.SLIGHTLY_HIGH
        }))

        // Failed: syndicates win, permanent corruption
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            economy: CL.NO_REGRESSION,  // Permanent economic damage
            security: CL.NO_REGRESSION,
            crime: CL.NO_REGRESSION,  // Crime entrenched
            wealth: CL.NO_REGRESSION,
            prestige: CL.LOW  // Failed state
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
    }

    determineOutcome() {
        const {planet: p} = this
        // Crime crackdown succeeds if security high enough
        this.rollOutcome(p.c.security * 0.55 + 0.45)
    }

    isValid() {
        const {planet: p} = this
        //more likely when black market prices are high (profitable for criminals)
        const ratingsValid = planet.settlement.blackMarket.inflation > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.ORGANIZED_CRIME, ...NT_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
