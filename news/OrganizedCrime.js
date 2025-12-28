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
                credits: CL.LOW,
                industry: CL.LOW,
                security: CL.LOW,
                crime: CL.VERY_HIGH,
                blackMarketPrices: CL.LOW,
                blackMarketCargoAmounts: CL.VERY_HIGH,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering corruption after
        Object.assign(this.endEffects[0], {
            economy: News.clHalfRegression(this.endEffects[0].economy),
            credits: News.clHalfRegression(this.endEffects[0].credits),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            security: News.clHalfRegression(this.endEffects[0].security),
            crime: News.clHalfRegression(this.endEffects[0].crime),
            blackMarketCargoAmounts: News.clHalfRegression(this.endEffects[0].blackMarketCargoAmounts),
        })

        // Failed: syndicates win, permanent corruption
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.NO_REGRESSION, // permanent economic damage
                security: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION, // crime entrenched
                credits: CL.NO_REGRESSION,
                prestige: CL.LOW, // failed state
            })
        ]
    }

    determineEnding() {
        const {planet} = this
        // Crime crackdown fails if security too low
        const failProbability = (1 - planet.culture.security) * 0.45
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
