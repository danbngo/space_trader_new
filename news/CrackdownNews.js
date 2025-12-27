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
                securityModifiedBy: 1.4,
                crimeModifiedBy: 0.7,
                militaryModifiedBy: 1.1,
                blackMarketCargoAmountsModifiedBy: 0.6,
                blackMarketPricesModifiedBy: 1.3,
                prestigeModifiedBy: 0.8, //other planets look unfavorably on this
                cargoPriceModifiers: new Map([[CARGO_TYPES.DRUGS, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering crime decrease
        Object.assign(this.endEffects[0], {
            crimeModifiedBy: (1 + this.endEffects[0].crimeModifiedBy)/2,
            blackMarketPricesModifiedBy: (1 + this.endEffects[0].blackMarketPricesModifiedBy)/2,
            blackMarketCargoAmountsModifiedBy: (1 + this.endEffects[0].blackMarketCargoAmountsModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //wouldnt happen in an anarchy, just sayin
        const govValid = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY
        //wont happen if crime is already low
        const crimeValid = planet.culture.crime > 1
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.CRACKDOWN, ...NEWS_TYPES_CRIME_PREVENTING])
        return govValid && crimeValid && !interferingEvent
    }
}
