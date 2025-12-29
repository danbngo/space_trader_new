class CrimeWaveNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Chronic poverty on ${coloredName(planet)} leads to a massive crime wave!`,
            `Authorities regain control as the crime wave on ${coloredName(planet)} ends!`,
            `${coloredName(planet)} fails to stop the crime wave! Lawlessness reigns!`,
            '',
            NT.CRIME_WAVE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                security: CL.LOW,
                crime: CL.EXTREMELY_HIGH,
                blackMarketCargoAmounts: CL.VERY_HIGH,
                blackMarketPrices: CL.VERY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.EXTREMELY_LOW], [CARGO_TYPES.DRUGS, CL.EXTREMELY_LOW]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering crime increase
        Object.assign(this.endEffects[0], {
            crime: News.clHalfRegression(this.endEffects[0].crime),
            blackMarketPrices: News.clHalfRegression(this.endEffects[0].blackMarketPrices),
            blackMarketCargoAmounts: News.clHalfRegression(this.endEffects[0].blackMarketCargoAmounts),
        })

        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                security: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                blackMarketCargoAmounts: CL.NO_REGRESSION,
                blackMarketPrices: CL.NO_REGRESSION,
                prestige: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.NO_REGRESSION], [CARGO_TYPES.DRUGS, CL.NO_REGRESSION]]),
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Higher security and military = more likely to stop crime
        const stopProbability = (planet.culture.security + planet.culture.military) / 2
        this.failed = Math.random() > stopProbability
    }

    isValid() {
        const {planet} = this
        //wont happen if crime or security is already high
        const povertyValid = planet.settlement.wealth < CL.MEDIUM
        const ratingsValid = planet.culture.crime < CL.MEDIUM && planet.culture.security < CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(planet, [NT.CRIME_WAVE, ...NT_CRIME_PREVENTING])
        return ratingsValid && povertyValid && !interferingEvent
    }
}
