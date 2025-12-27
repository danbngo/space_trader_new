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
                prestigeModifiedBy: 1.2, //this makes you scary...
                militaryModifiedBy: 0.9, //but expends some of your arsenal
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                populationModifiedBy: 0.85,
                militaryModifiedBy: 0.8,
                industryModifiedBy: 0.7,
                commerceModifiedBy: 0.7,
                securityModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 0.8,
                marketPricesModifiedBy: 2,
                shipQualityModifiedBy: 0.9, //back to the stone age!
                officerQualityModifiedBy: 0.9,
                prestigeModifiedBy: 0.8,
                buildingsDisabled: buildingsToDisable,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 2], [CARGO_TYPES.MEDICINE, 2], [CARGO_TYPES.HOLOCUBES, 0.5]]), //this is the only thing that normalizes after
            })
        ]

        //dont automatically recover. lets add recovery events elsewhere
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[1], {
            populationModifiedBy: 1.0,
            militaryModifiedBy: 1.0,
            industryModifiedBy: 1.0,
            commerceModifiedBy: 1.0,
            securityModifiedBy: 1.0,
            marketCargoAmountsModifiedBy: 1.0,
            //marketPricesModifiedBy: 1.0, //prices will normalize
            shipQualityModifiedBy: 1.0,
            officerQualityModifiedBy: 1.0,
            prestigeModifiedBy: 1.0,
            buildingsEnabled: [],
            forcePeace: true,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planet must not already be at war with the target planet
        const ratingsValid = planet.culture.military > targetPlanet.culture.military
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = 
            News.hasNews(NEWS_TYPES.BOMBARDMENT, planet, targetPlanet) || 
            News.hasAnyNewsBidirectional(planet, targetPlanet, NEWS_TYPES_COOPERATIVE)
        return ratingsValid && relationshipValid && !interferingEvent
    }
}
