class BombardmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} suffers orbital bombardment from ${coloredName(planet)}!`,
            `${coloredName(planet)}'s orbital bombardment of ${coloredName(targetPlanet)} ends!`,
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
                prestigeRatingModifiedBy: 1.2, //this makes you scary...
                militaryRatingModifiedBy: 0.9, //but expends some of your arsenal
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                populationModifiedBy: 0.85,
                militaryRatingModifiedBy: 0.8,
                industrialRatingModifiedBy: 0.7,
                commercialRatingModifiedBy: 0.7,
                securityRatingModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 0.8,
                marketPricesModifiedBy: 2,
                shipQualityModifiedBy: 0.9, //back to the stone age!
                officerQualityModifiedBy: 0.9,
                buildingsDisabled: buildingsToDisable,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WATER, 2], [CARGO_TYPES.MEDICINE, 2], [CARGO_TYPES.HOLOCUBES, 0.5]]), //this is the only thing that normalizes after
            })
        ]

        //dont automatically recover. lets add recovery events elsewhere
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[1], {
            populationModifiedBy: 1.0,
            militaryRatingModifiedBy: 1.0,
            industrialRatingModifiedBy: 1.0,
            commercialRatingModifiedBy: 1.0,
            securityRatingModifiedBy: 1.0,
            marketCargoAmountsModifiedBy: 1.0,
            //marketPricesModifiedBy: 1.0, //prices will normalize
            shipQualityModifiedBy: 1.0,
            officerQualityModifiedBy: 1.0,
            buildingsEnabled: [],
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planet must not already be at war with the target planet
        const ratingsValid = planet.culture.militaryRating > 1 //need to actually have enough ships to hurt them
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.BOMBARDMENT, targetPlanet) || 
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet) ||
            News.hasNews(planet, NEWS_TYPES.TRADE_AGREEMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TRADE_AGREEMENT, planet) ||
            News.hasNews(planet, NEWS_TYPES.RESEARCH_AGREEMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.RESEARCH_AGREEMENT, planet)
        return ratingsValid && relationshipValid && !interferingEvent
    }
}
