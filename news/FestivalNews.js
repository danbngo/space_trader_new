class FestivalNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} announces an extravagant festival open to all visitors, diverting resources to celebrate!`,
            `${coloredName(planet)}'s festival concludes, leaving the planet with enhanced prestige!`,
            NT.FESTIVAL, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                credits: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                marketCargoAmounts: CL.LOW,
                crime: CL.HIGH,
                blackMarketPrices: CL.HIGH,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //economy recovers, prestige is boosted
        Object.assign(this.endEffects[0], {
            credits: News.clHalfRegression(this.endEffects[0].credits),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            crime: News.clHalfRegression(this.endEffects[0].crime),
            //blackMarketPrices: News.clHalfRegression(this.endEffects[0].blackMarketPrices),
            prestige: CL.SLIGHTLY_HIGH,
        })
    }

    isValid() {
        const {planet} = this
        //need high credits to afford it, low prestige to want it
        const ratingsValid = planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS > CL.SLIGHTLY_HIGH && planet.culture.prestige < CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(planet, [NT.FESTIVAL, ...NT_ECONOMY_PREVENTING, ...NT_DANGEROUS])
        return ratingsValid && !interferingEvent
    }
}
