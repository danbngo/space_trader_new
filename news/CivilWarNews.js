class CivilWarNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Civil war breaks out on ${coloredName(planet)}!`,
            `${coloredName(planet)}'s civil war ends!`,
            `${coloredName(planet)}'s civil war ends in disaster! The planet is devastated!`,
            '',
            NT.CIVIL_WAR, planet
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
                //newGovernmentType: GT.ANARCHY, //there IS a government still
                territory: CL.SLIGHTLY_LOW,
                military: CL.VERY_LOW,
                security: CL.LOW,
                crime: CL.VERY_HIGH,
                population: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                marketCargoAmounts: CL.LOW,
                marketPrices: CL.HIGH,
                blackMarketCargoAmounts: CL.VERY_HIGH,
                credits: CL.LOW,
                prestige: CL.LOW,
                buildingsDisabled: buildingsToDisable,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 2], [CARGO_TYPES.ANTIMATTER, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //end up with a new form of government
        this.endEffects[0].newGovernmentType = Math.random() > .5 ? this.planet.culture.governmentType : rndMember(GT_ALL.filter(g => g !== GT.PUPPET_STATE)),

        //some lingering ill effects on population, prestige, territory, military
        Object.assign(this.endEffects[0], {
            population: News.clHalfRegression(this.endEffects[0].population),
            prestige: News.clHalfRegression(this.endEffects[0].prestige),
            territory: News.clHalfRegression(this.endEffects[0].territory),
            military: News.clHalfRegression(this.endEffects[0].military),
        })

        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                territory: CL.NO_REGRESSION,
                military: CL.NO_REGRESSION,
                security: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                population: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
                prestige: CL.NO_REGRESSION,
                buildingsEnabled: [],
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.NO_REGRESSION], [CARGO_TYPES.ANTIMATTER, CL.NO_REGRESSION]]),
            })
        ]
    }

    determineEnding() {
        const {planet} = this
        // Higher prestige and economy = more likely to end cleanly
        const resolveProbability = (planet.culture.prestige + planet.culture.economy) / 2
        this.failed = Math.random() > resolveProbability
    }
    isValid() {
        const {planet} = this
        //usually happens when military is large
        const ratingsValid = planet.culture.military > CL.HIGH
        //planet must not already be in anarchy or puppet state
        const validGov = planet.culture.governmentType != GT.ANARCHY && planet.culture.governmentType != GT.PUPPET_STATE
        //cant be having any of: construction, economic boom, revolution
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.CIVIL_WAR, NT.ECONOMIC_BOOM, NT.REVOLUTION]) ||
            News.hasNewsTargeting(NT.WAR, planet)
        return ratingsValid && validGov && !interferingEvent
    }
}
