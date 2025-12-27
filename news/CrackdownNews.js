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
                security: 1.4,
                crime: 0.7,
                military: 1.1,
                blackMarketCargoAmounts: 0.6,
                blackMarketPrices: 1.5,
                prestige: 0.8, //other planets look unfavorably on this
                cargoPriceModifiers: new Map([[CARGO_TYPES.DRUGS, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering crime decrease
        Object.assign(this.endEffects[0], {
            crime: (1 + this.endEffects[0].crime)/2,
            //blackMarketPrices: (1 + this.endEffects[0].blackMarketPrices)/2,
            blackMarketCargoAmounts: (1 + this.endEffects[0].blackMarketCargoAmounts)/2,
        })
    }

    isValid() {
        const {planet} = this
        //wouldnt happen in an anarchy, just sayin
        const govValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY
        //wont happen if crime is already low AND black market amount/price is low
        const crimeValid = (planet.culture.crime > 1.5 || planet.settlement.blackMarket.inflation > 1.5 || planet.settlement.blackMarket.baseCargo.average / MARKET_AVERAGE_CARGO_PER_TYPE > 1.5)
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.CRACKDOWN, ...NEWS_TYPES_CRIME_PREVENTING])
        return govValid && crimeValid && !interferingEvent
    }
}
