class DepressionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} enters a Depression!`,
            `${coloredName(planet)} is stumbling out of its Depression!`,
            `${coloredName(planet)}'s Depression deepens! Economic collapse imminent!`,
            '',
            NT.DEPRESSION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: CL.EXTREMELY_LOW,
                marketCargoAmounts: CL.EXTREMELY_LOW,
                economy: CL.EXTREMELY_LOW,
                industry: CL.VERY_LOW,
                credits: CL.EXTREMELY_LOW,
                crime: CL.HIGH,
                guildNumOfficers: CL.HIGH,
                //blackMarketCargoAmounts: 0.7, -recession-proof industry
                blackMarketPrices: CL.SLIGHTLY_LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //some lingering price rate, cargo, commercial, and credit rate decreases
        Object.assign(this.endEffects[0], {
            credits: News.clHalfRegression(this.endEffects[0].credits),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            marketPrices: News.clHalfRegression(this.endEffects[0].marketPrices),
            economy: News.clHalfRegression(this.endEffects[0].economy),
            blackMarketPrices: (1 + this.endEffects[0].blackMarketPrices)/2,
            //blackMarketCargoAmounts: (1 + this.endEffects[0].blackMarketCargoAmounts)/2,
        })

        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: CL.NO_REGRESSION,
                marketCargoAmounts: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
                credits: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW,
            })
        ]
    }

    determineEnding() {
        const {planet} = this
        // Higher industry and prestige = more likely to recover
        const recoveryProbability = (planet.culture.industry + planet.culture.prestige) / 2
        this.failed = Math.random() > recoveryProbability
    }

    isValid() {
        const {planet} = this
        //more likely to happen when credit is REALLY high
        const ratingsValid = (planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS) > CL.HIGH && planet.culture.economy < CL.HIGH
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.DEPRESSION, ...NT_ECONOMY_BOOSTING]) || 
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_BOOSTING)
        return ratingsValid && !interferingEvent
    }
}
