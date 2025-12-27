class CivilWarNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Civil war breaks out on ${coloredName(planet)}!`,
            `${coloredName(planet)}'s civil war ends!`,
            NEWS_TYPES.CIVIL_WAR, planet
        )

        const buildingsToDisable = [];
        const numBuildings = Math.floor(Math.random() * 4) + 2; // 2-5 buildings
        const enabledBuildings = planet.settlement.buildings.filter(b => b.enabled);
        for (let i = 0; i < Math.min(numBuildings, enabledBuildings.length); i++) {
            const building = rndMember(enabledBuildings.filter(b => b.enabled && !buildingsToDisable.includes(b)));
            if (building) buildingsToDisable.push(building);
        }

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                newGovernmentType: GOVERNMENT_TYPES.ANARCHY,
                territoryModifiedBy: 0.8,
                militaryModifiedBy: 0.4,
                securityModifiedBy: 0.7,
                crimeModifiedBy: 1.4,
                populationModifiedBy: 0.7,
                commerceModifiedBy: 0.5,
                industryModifiedBy: 0.6,
                marketCargoAmountsModifiedBy: 0.3,
                marketPricesModifiedBy: 1.3,
                blackMarketCargoAmountsModifiedBy: 1.4,
                creditsModifiedBy: 0.4,
                prestigeModifiedBy: 0.8,
                buildingsDisabled: buildingsToDisable,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 2], [CARGO_TYPES.ANTIMATTER, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //end up with a new form of government
        this.endEffects[0].newGovernmentType = Math.random() > .5 ? this.planet.culture.governmentType : rndMember(GOVERNMENT_TYPES_ALL.filter(g => g !== GOVERNMENT_TYPES.ANARCHY && g !== GOVERNMENT_TYPES.PUPPET_STATE)),

        //some lingering ill effects on population, prestige, territory, military
        Object.assign(this.endEffects[0], {
            populationModifiedBy: (1 + this.endEffects[0].populationModifiedBy)/2,
            prestigeModifiedBy: (1 + this.endEffects[0].prestigeModifiedBy)/2,
            territoryModifiedBy: (1 + this.endEffects[0].territoryModifiedBy)/2,
            militaryModifiedBy: (1 + this.endEffects[0].militaryModifiedBy)/2,
        })
    }
    isValid() {
        const {planet} = this
        //usually happens when military is large
        const ratingsValid = planet.culture.military > 1.0
        //planet must not already be in anarchy or puppet state
        const validGov = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        //cant be having any of: construction, economic boom, revolution
        const interferingEvent =
            News.planetHasAnyNews(planet, [NEWS_TYPES.CIVIL_WAR, NEWS_TYPES.ECONOMIC_BOOM, NEWS_TYPES.REVOLUTION]) ||
            News.hasNewsTargeting(NEWS_TYPES.WAR, planet)
        return ratingsValid && validGov && !interferingEvent
    }
}
