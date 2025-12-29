class AddictionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is suffering an addiction crisis! Synthetic drugs are ravaging the population!`,
            `${coloredName(planet)}'s addiction crisis was successfully mitigated by the government!`,
            `${coloredName(planet)}'s addiction crisis has become terminal with no end in sight!`,
            '',
            NT.ADDICTION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                security: CL.LOW,
                crime: CL.HIGH,
                economy: CL.LOW,
                blackMarketCargoAmounts: CL.VERY_LOW,
                blackMarketPrices: CL.VERY_HIGH,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, CL.VERY_HIGH], [CARGO_TYPES.DRUGS, CL.EXTREMELY_HIGH]]), //this is the only thing that normalizes after
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.failEffects[0], {
            cargoPriceModifiers: NewsEffect.getInvertedCargoPriceModifiers(this.startEffects[0].cargoPriceModifiers)            
        })
    }

    determineEnding() {
        const {planet} = this
        // Higher security and economy = more likely to overcome addiction
        const overcomeProbability = (planet.culture.security + planet.culture.economy) / 2
        this.failed = Math.random() > overcomeProbability
    }

    isValid() {
        const {planet} = this
        //more likely if high drug availability
        const ratingsValid = (planet.settlement.illegalGoods) > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.ADDICTION, ...NT_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
