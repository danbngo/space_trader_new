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
                newGovernmentTypeType: GOVERNMENT_TYPES.ANARCHY,
                militaryRatingModifiedBy: 0.4,
                securityRatingModifiedBy: 0.4,
                crimeRatingModifiedBy: 1.4,
                populationModifiedBy: 0.7,
                commercialRatingModifiedBy: 0.5,
                industrialRatingModifiedBy: 0.6,
                marketCargoAmountsModifiedBy: 0.3,
                marketPricesModifiedBy: 1.3,
                blackMarketCargoAmountsModifiedBy: 1.4,
                creditsModifiedBy: 0.4,
                prestigeRatingModifiedBy: 0.6,
                buildingsDisabled: buildingsToDisable,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 2], [CARGO_TYPES.ANTIMATTER, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //end up with a new form of government
        this.endEffects[0].newGovernmentTypeType = Math.random() > .5 ? this.planet.culture.governmentType : rndMember(GOVERNMENT_TYPES_ALL.filter(g => g !== GOVERNMENT_TYPES.ANARCHY && g !== GOVERNMENT_TYPES.PUPPET_STATE)),

        //some lingering ill effects on population
        Object.assign(this.endEffects[0], {
            populationModifiedBy: (1 + this.endEffects[0].populationModifiedBy)/2,
        })
    }
    isValid() {
        const {planet} = this
        //planet must not already be in anarchy or puppet state
        const validGov = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        //cant be having any of: construction, economic boom, revolution
        const interferingEvent =
            News.hasNews(planet, NEWS_TYPES.CIVIL_WAR) || News.hasNews(planet, NEWS_TYPES.CONSTRUCTION) ||
            News.hasNews(planet, NEWS_TYPES.ECONOMIC_BOOM) || News.hasNews(planet, NEWS_TYPES.REVOLUTION) ||
            News.hasNewsTargeting(planet, NEWS_TYPES.WAR)
        return validGov && !interferingEvent
    }
}
