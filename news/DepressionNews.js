class DepressionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} enters a Depression!`,
            `${coloredName(planet)} is stumbling out of its Depression!`,
            NEWS_TYPES.DEPRESSION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: CL.EXTREMELY_LOW,
                marketCargoAmounts: CL.EXTREMELY_LOW,
                commerce: CL.EXTREMELY_LOW,
                industry: CL.VERY_LOW,
                credits: CL.EXTREMELY_LOW,
                crime: CL.HIGH,
                guildNumOfficers: CL.HIGH,
                //blackMarketCargoAmounts: 0.7, -recession-proof industry
                //blackMarketPrices: 0.7,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //some lingering price rate, cargo, commercial, and credit rate decreases
        Object.assign(this.endEffects[0], {
            credits: News.clHalfRegression(this.endEffects[0].credits),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            marketPrices: News.clHalfRegression(this.endEffects[0].marketPrices),
            commerce: News.clHalfRegression(this.endEffects[0].commerce),
            //blackMarketPrices: (1 + this.endEffects[0].blackMarketPrices)/2,
            //blackMarketCargoAmounts: (1 + this.endEffects[0].blackMarketCargoAmounts)/2,
        })
    }

    isValid() {
        const {planet} = this
        //more likely to happen when credit is REALLY high
        const ratingsValid = (planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS) > CL.HIGH && planet.culture.commerce < CL.HIGH
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.DEPRESSION, ...NEWS_TYPES_ECONOMY_BOOSTING]) || 
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_BOOSTING)
        return ratingsValid && !interferingEvent
    }
}
