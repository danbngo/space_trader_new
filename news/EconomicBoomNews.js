class EconomicBoomNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} experiences an economic boom! Its citizens are living in a gilded age!`,
            `${coloredName(planet)}'s booming economy normalizes.`,
            `${coloredName(planet)}'s economic bubble bursts! Recession hits!`,
            '',
            NT.ECONOMIC_BOOM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                inflation: CL.VERY_LOW,
                stockpile: CL.VERY_HIGH,
                crime: CL.VERY_HIGH,
                //dont effect BM prices due to decadent spending!
                economy: CL.EXTREMELY_HIGH,
                industry: CL.VERY_HIGH,
                credits: CL.EXTREMELY_HIGH,
                ships: CL.VERY_HIGH,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, CL.EXTREMELY_HIGH]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[0], {
            credits: News.clHalfRegression(this.completeEffects[0].credits),
            economy: News.clHalfRegression(this.completeEffects[0].economy),
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                inflation: CL.HIGH,
                stockpile: CL.LOW,
                crime: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                credits: CL.VERY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, CL.NO_REGRESSION]]),
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Higher industry and economy = more sustainable boom
        const sustainProbability = (planet.civilization.industry + planet.civilization.economy) / 2
        this.failed = Math.random() > sustainProbability
    }

    isValid() {
        const {planet} = this
        //cant already having a booming economy
        const ratingsValid = planet.civilization.economy < CL.VERY_HIGH && planet.settlement.wealth < CL.VERY_HIGH
        //basically just a bonus for not being in a war or anything stupid
        const interferingEvent = 
            News.planetHasAnyNews(planet, [NT.ECONOMIC_BOOM, ...NT_ECONOMY_PREVENTING]) ||
            News.planetHasAnyNewsTargeting(planet, [...NT_DANGEROUS, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
