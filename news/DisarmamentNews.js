class DisarmamentNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} seeks peace and begins a period of disarmament!`,
            `${coloredName(planet)}'s disarmament period comes to an end!`,
            NEWS_TYPES.DISARMAMENT, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                military: CL.LOW,
                territory: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW], [CARGO_TYPES.WEAPONS, CL.EXTREMELY_LOW]]),
                blackMarketCargoAmounts: CL.LOW, //bit less weapons
                blackMarketPrices: CL.VERY_LOW,
                shipyardNumShips: CL.LOW,
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            military: News.CL_NO_REGRESSION, 
            territory: News.CL_NO_REGRESSION,
            commerce: CL.SLIGHTLY_HIGH, //small bonuses to the economy
            industry: CL.SLIGHTLY_HIGH,
            prestige: CL.HIGH,
            shipyardNumShips: News.CL_NO_REGRESSION,
        })
    }

    isValid() {
        const {planet} = this
        //unlikely if planet has a low military already
        const ratingsValid = planet.culture.military > 1.5 || planet.settlement.shipyard.baseNumShips > 1.5
        const interferingEvent =
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_MARTIAL) ||
            News.planetHasAnyNews(planet, NEWS_TYPES_MARTIAL)
        return ratingsValid && !interferingEvent
    }
}
