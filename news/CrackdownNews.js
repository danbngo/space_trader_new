class CrackdownNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Government cracks down on crime on ${coloredName(planet)}!`,
            `The anti-crime crackdown on ${coloredName(planet)} ends.`,
            NEWS_TYPES.CRACKDOWN, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                security: CL.VERY_HIGH,
                crime: CL.EXTREMELY_LOW,
                blackMarketCargoAmounts: CL.VERY_LOW,
                blackMarketPrices: CL.VERY_HIGH,
                prestige: CL.SLIGHTLY_LOW, //other planets look unfavorably on this
                cargoPriceModifiers: new Map([[CARGO_TYPES.DRUGS, CL.EXTREMELY_HIGH]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering crime decrease
        Object.assign(this.endEffects[0], {
            prestige: CL.NO_REGRESSION,
            security: News.clHalfRegression(this.endEffects[0].security),
            crime: News.clHalfRegression(this.endEffects[0].crime),
            blackMarketPrices: News.clHalfRegression(this.endEffects[0].blackMarketPrices),
            blackMarketCargoAmounts: News.clHalfRegression(this.endEffects[0].blackMarketCargoAmounts),
        })
    }

    isValid() {
        const {planet} = this
        //wouldnt happen in an anarchy, just sayin
        const govValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY
        //wont happen if crime is already low AND black market amount/price is low
        const crimeValid = (planet.culture.crime > CL.HIGH || planet.settlement.blackMarket.inflation > CL.HIGH || planet.settlement.blackMarket.baseCargo.average / MARKET_AVERAGE_CARGO_PER_TYPE > CL.HIGH)
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.CRACKDOWN, ...NEWS_TYPES_CRIME_PREVENTING])
        return govValid && crimeValid && !interferingEvent
    }
}
