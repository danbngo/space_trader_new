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
                prestige: 1.2, //this makes you scary...
                military: 0.9, //but expends some of your arsenal
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                population: 0.85,
                military: 0.5,
                industry: 0.4,
                commerce: 0.7,
                security: 0.8,
                marketCargoAmounts: 0.8,
                marketPrices: 2,
                shipQuality: 0.8, //back to the stone age!
                officerQuality: 0.8,
                prestige: 0.6,
                buildingsDisabled: buildingsToDisable,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 2], [CARGO_TYPES.MEDICINE, 2], [CARGO_TYPES.HOLOCUBES, 0.5]]), //this is the only thing that normalizes after
            })
        ]

        //dont automatically recover. lets add recovery events elsewhere
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[1], {
            population: 1.0,
            military: 1.0,
            industry: 1.0,
            commerce: 1.0,
            security: 1.0,
            marketCargoAmounts: 1.0,
            //marketPrices: 1.0, //prices will normalize
            shipQuality: 1.0,
            officerQuality: 1.0,
            prestige: 1.0,
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
