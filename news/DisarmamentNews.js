class DisarmamentNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} seeks system-wide peace and begins a period of disarmament!`,
            `${coloredName(planet)}'s disarmament period comes to an end!`,
            NEWS_TYPES.DISARMAMENT, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                military: CL.VERY_LOW,
                territory: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW], [CARGO_TYPES.WEAPONS, CL.EXTREMELY_LOW]]),
                blackMarketCargoAmounts: CL.SLIGHTLY_LOW,
                shipyardNumShips: CL.VERY_LOW,
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            military: CL.NO_REGRESSION, 
            territory: CL.NO_REGRESSION,
            shipyardNumShips: CL.NO_REGRESSION,
            commerce: CL.SLIGHTLY_HIGH, //small bonuses to the economy
            industry: CL.SLIGHTLY_HIGH,
            prestige: CL.HIGH,
        })
    }

    isValid() {
        const {planet} = this
        //unlikely if planet has a low military already
        const ratingsValid = planet.culture.military > CL.HIGH || planet.settlement.shipyard.baseNumShips > CL.HIGH
        const interferingEvent =
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_MARTIAL) ||
            News.planetHasAnyNews(planet, NEWS_TYPES_MARTIAL)
        return ratingsValid && !interferingEvent
    }
}
