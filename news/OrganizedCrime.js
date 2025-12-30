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
                economy: CL.LOW,
                wealth: CL.LOW,
                industry: CL.LOW,
                security: CL.LOW,
                crime: CL.VERY_HIGH,
                corruption: CL.VERY_HIGH,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering corruption after
        Object.assign(this.completeEffects[0], {
            economy: News.clHalfRegression(this.completeEffects[0].economy),
            wealth: News.clHalfRegression(this.completeEffects[0].wealth),
            industry: News.clHalfRegression(this.completeEffects[0].industry),
            security: News.clHalfRegression(this.completeEffects[0].security),
            crime: News.clHalfRegression(this.completeEffects[0].crime),
        })

        // Failed: syndicates win, permanent corruption
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.NO_REGRESSION, // permanent economic damage
                security: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION, // crime entrenched
                wealth: CL.NO_REGRESSION,
                prestige: CL.LOW, // failed state
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Crime crackdown fails if security too low
        const failProbability = (1 - planet.civilization.security) * 0.45
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet} = this
        //more likely when black market prices are high (profitable for criminals)
        const ratingsValid = planet.settlement.blackMarket.inflation > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.ORGANIZED_CRIME, ...NT_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
