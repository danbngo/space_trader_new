class BombardmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} commences orbital bombardment of ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s orbital bombardment of ${coloredName(targetPlanet)} has forced their surrender!`,
            NEWS_TYPES.BOMBARDMENT, planet, targetPlanet
        )

        const buildingsToDisable = [];
        const numBuildings = Math.floor(Math.random() * 3) + 1; // 1-3 buildings
        const enabledBuildings = targetPlanet.settlement.buildings.filter(b => b.enabled);
        for (let i = 0; i < Math.min(numBuildings, enabledBuildings.length); i++) {
            const building = rndMember(enabledBuildings.filter(b => b.enabled && !buildingsToDisable.includes(b)));
            if (building) buildingsToDisable.push(building);
        }

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                prestige: CL.HIGH, //this makes you scary...
                military: CL.SLIGHTLY_LOW, //but expends some of your arsenal
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                population: CL.SLIGHTLY_LOW,
                military: CL.EXTREMELY_LOW,
                industry: 0.4,
                commerce: CL.LOW,
                security: CL.LOW,
                marketCargoAmounts: CL.LOW,
                marketPrices: CL.EXTREMELY_HIGH,
                shipQuality: CL.LOW, //back to the stone age!
                officerQuality: CL.LOW,
                prestige: CL.VERY_LOW,
                buildingsDisabled: buildingsToDisable,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 2], [CARGO_TYPES.MEDICINE, 2], [CARGO_TYPES.HOLOCUBES, 0.5]]), //this is the only thing that normalizes after
            })
        ]

        //dont automatically recover. lets add recovery events elsewhere
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[1], {
            population: News.CL_NO_REGRESSION,
            military: News.CL_NO_REGRESSION,
            industry: News.CL_NO_REGRESSION,
            commerce: News.CL_NO_REGRESSION,
            security: News.CL_NO_REGRESSION,
            marketCargoAmounts: News.CL_NO_REGRESSION,
            //marketPrices: News.CL_NO_REGRESSION, //prices will normalize
            shipQuality: News.CL_NO_REGRESSION,
            officerQuality: News.CL_NO_REGRESSION,
            prestige: News.CL_NO_REGRESSION,
            buildingsEnabled: [],
            forcePeace: true,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planet must not already be at war with the target planet
        const ratingsValid = planet.culture.military > targetPlanet.culture.military * 1.5
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = 
            News.hasNews(NEWS_TYPES.BOMBARDMENT, planet, targetPlanet) || 
            News.hasAnyNewsBidirectional(planet, targetPlanet, NEWS_TYPES_COOPERATIVE)
        return ratingsValid && relationshipValid && !interferingEvent
    }
}
