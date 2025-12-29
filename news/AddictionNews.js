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
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            security: News.clHalfRegression(this.endEffects[0].security),
            population: News.clHalfRegression(this.endEffects[0].population),
            blackMarketPrices: News.clHalfRegression(this.endEffects[0].blackMarketPrices),
            blackMarketCargoAmounts: News.clHalfRegression(this.endEffects[0].blackMarketCargoAmounts),
            crime: News.clHalfRegression(this.endEffects[0].crime),
        })

        this.failEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            population: CL.NO_REGRESSION,
            security: CL.NO_REGRESSION,
            crime: CL.NO_REGRESSION,
            economy: CL.NO_REGRESSION,
            blackMarketPrices: CL.NO_REGRESSION,
            
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
        const ratingsValid = (planet.settlement.blackMarket.baseCargo.getAmount(CARGO_TYPES.DRUGS) / MARKET_AVERAGE_CARGO_PER_TYPE) > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.ADDICTION, ...NT_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
