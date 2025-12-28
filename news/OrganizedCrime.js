class OrganizedCrimeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is infiltrated by organized crime syndicates, corrupting the planet!`,
            `${coloredName(planet)} conducts high profile arrests and declares victory over the syndicates!`,
            NEWS_TYPES.ORGANIZED_CRIME, planet
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
    }

    isValid() {
        const {planet} = this
        //more likely when black market prices are high (profitable for criminals)
        const ratingsValid = planet.settlement.blackMarket.inflation > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.ORGANIZED_CRIME, ...NEWS_TYPES_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
