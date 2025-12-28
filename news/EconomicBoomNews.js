class EconomicBoomNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} experiences an economic boom! Its citizens are living in a gilded age!`,
            `${coloredName(planet)}'s booming economy normalizes.`,
            NT.ECONOMIC_BOOM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: CL.VERY_LOW,
                marketCargoAmounts: CL.VERY_HIGH,
                blackMarketCargoAmounts: CL.VERY_HIGH,
                //dont effect BM prices due to decadent spending!
                economy: CL.EXTREMELY_HIGH,
                industry: CL.VERY_HIGH,
                credits: CL.EXTREMELY_HIGH,
                shipyardNumShips: CL.VERY_HIGH,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, CL.EXTREMELY_HIGH]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            credits: News.clHalfRegression(this.endEffects[0].credits),
            economy: News.clHalfRegression(this.endEffects[0].economy),
        })
    }

    isValid() {
        const {planet} = this
        //cant already having a booming economy
        const ratingsValid = planet.culture.economy < CL.VERY_HIGH && planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS < CL.VERY_HIGH
        //basically just a bonus for not being in a war or anything stupid
        const interferingEvent = 
            News.planetHasAnyNews(planet, [NT.ECONOMIC_BOOM, ...NT_ECONOMY_PREVENTING]) ||
            News.planetHasAnyNewsTargeting(planet, [...NT_DANGEROUS, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
