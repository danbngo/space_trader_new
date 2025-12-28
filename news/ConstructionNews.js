class ConstructionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins a grand infrastructure building project!`,
            `${coloredName(planet)} completes its grand infrastructure building project!`,
            NEWS_TYPES.CONSTRUCTION, planet
        )

        const buildingsToEnable = [];
        const numBuildings = Math.floor(Math.random() * 3) + 1; // 1-3 buildings
        const disabledBuildings = planet.settlement.buildings.filter(b => !b.enabled);
        for (let i = 0; i < Math.min(numBuildings, disabledBuildings.length); i++) {
            const building = rndMember(disabledBuildings.filter(b => !b.enabled && !buildingsToEnable.includes(b)));
            if (building) buildingsToEnable.push(building);
        }

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                commerce: CL.SLIGHTLY_LOW,
                marketCargoAmounts: CL.LOW,
                marketPrices: CL.HIGH,
                shipyardNumShips: CL.HIGH,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, CL.EXTREMELY_HIGH], [CARGO_TYPES.NANITES, CL.ASTRONOMICAL]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            marketCargoAmounts: CL.NO_REGRESSION,
            industry: CL.HIGH,
            buildingsEnabled: buildingsToEnable,
        })
    }

    isValid() {
        const {planet} = this
        //must be missing at least one building OR industry is low
        const buildingsValid = planet.settlement.buildings.filter(b => !b.enabled).length > 0
        const industryValid = planet.culture.industry < CL.LOW && planet.settlement.market.cargo.average/MARKET_AVERAGE_CARGO_PER_TYPE > CL.MEDIUM
        const interferingEvent =
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_HOSTILE) ||
            News.planetHasAnyNews(planet, [NEWS_TYPES.CONSTRUCTION, ...NEWS_TYPES_ECONOMY_PREVENTING])
        return (buildingsValid || industryValid) && !interferingEvent
    }
}
