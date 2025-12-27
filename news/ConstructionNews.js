class ConstructionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins a grand construction project!`,
            `${coloredName(planet)} completes its grand construction project!`,
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
                industryModifiedBy: 0.7,
                commerceModifiedBy: 0.9,
                marketCargoAmountsModifiedBy: 0.8,
                marketPricesModifiedBy: 1.2,
                shipyardNumShipsModifiedBy: 1.2,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, 2], [CARGO_TYPES.NANITES, 3]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            industryModifiedBy: (2 + this.endEffects[0].industryModifiedBy)/2, //industrial base bounces back stronger
            buildingsEnabled: buildingsToEnable,
        })
    }

    isValid() {
        const {planet} = this
        //must be missing at least one building
        const buildingsValid = planet.settlement.buildings.filter(b => !b.enabled).length > 0
        const interferingEvent =
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_HOSTILE) ||
            News.planetHasAnyNews(planet, [NEWS_TYPES.CONSTRUCTION, ...NEWS_TYPES_ECONOMY_PREVENTING])
        return buildingsValid && !interferingEvent
    }
}
