class ConstructionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins a grand infrastructure building project!`,
            `${coloredName(planet)} completes its grand infrastructure building project!`,
            `${coloredName(planet)}'s construction project fails! Resources wasted!`,
            '',
            NT.CONSTRUCTION, planet
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
                economy: CL.SLIGHTLY_LOW,
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
            economy: CL.SLIGHTLY_HIGH,
            buildingsEnabled: buildingsToEnable,
        })

        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.NO_REGRESSION,
                marketCargoAmounts: CL.NO_REGRESSION,
                prestige: CL.LOW,
                buildingsEnabled: [],
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, CL.NO_REGRESSION], [CARGO_TYPES.NANITES, CL.NO_REGRESSION]]),
            })
        ]
    }

    determineEnding() {
        const {planet} = this
        // Higher industry and economy = more likely to succeed
        const successProbability = (planet.culture.industry + planet.culture.economy) / 2
        this.failed = Math.random() > successProbability
    }

    isValid() {
        const {planet} = this
        //must be missing at least one building OR industry is low
        const buildingsValid = planet.settlement.buildings.filter(b => !b.enabled).length > 0
        const industryValid = planet.culture.industry < CL.LOW && planet.settlement.market.cargo.average/MARKET_AVERAGE_CARGO_PER_TYPE > CL.MEDIUM
        const interferingEvent =
            News.planetHasAnyNewsTargeting(planet, NT_DANGEROUS) ||
            News.planetHasAnyNews(planet, [NT.CONSTRUCTION, ...NT_ECONOMY_PREVENTING])
        return (buildingsValid || industryValid) && !interferingEvent
    }
}
