class LudditismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} embraces a return-to-soil movement, rejecting advanced technology for a simpler life!`,
            `${coloredName(planet)}'s people have completed their transition to a more pastoral life!`,
            NEWS_TYPES.LUDDITISM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                shipQuality: CL.VERY_LOW,
                military: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                officerQuality: CL.SLIGHTLY_LOW,
                crime: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([
                    [CARGO_TYPES.NANITES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.HOLOCUBES, CL.VERY_LOW]
                ]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //population growth and prestige boost from simpler lifestyle
        Object.assign(this.endEffects[0], {
            population: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
            shipQuality: News.clHalfRegression(this.endEffects[0].shipQuality), //tech knowledge lost
            officerQuality: News.clHalfRegression(this.endEffects[0].officerQuality), //tech knowledge lost
            military: News.clHalfRegression(this.endEffects[0].military),
            economy: News.clHalfRegression(this.endEffects[0].economy),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            crime: News.clHalfRegression(this.endEffects[0].crime),
            blackMarketCargoAmounts: CL.LOW,
            blackMarketPrices: CL.LOW,
        })
    }

    isValid() {
        const {planet} = this
        //more likely if high tech and population pressure
        const ratingsValid = planet.culture.shipQuality > CL.HIGH && planet.culture.industry > CL.MEDIUM
        //must not be at engaged in or targeted by any hostile acts
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.LUDDITISM, ...NEWS_TYPES_DANGEROUS]) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_DANGEROUS) 
        return ratingsValid && !interferingEvent
    }
}
