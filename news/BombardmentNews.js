class BombardmentNews extends News {
    constructor(planet = new Planet(), startYear = gs.year, targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} suffers orbital bombardment from ${coloredName(planet)}!`,
            `${coloredName(planet)}'s orbital bombardment of ${coloredName(planet)} ends!`,
            NEWS_TYPES.BOMBARDMENT, planet, targetPlanet, startYear
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
                planet: this.targetPlanet,
                prestigeRatingModifiedBy: 1.2, //this makes you scary...
                militaryRatingModifiedBy: 0.9, //but expends some of your arsenal
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                populationModifiedBy: 0.85,
                militaryRatingModifiedBy: 0.8,
                industrialRatingModifiedBy: 0.7,
                commercialRatingModifiedBy: 0.7,
                securityRatingModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 0.8,
                buildingsDisabled: buildingsToDisable,
            })
        ]

        //dont automatically recover. lets add recovery events elsewhere
        this.endEffects = []//this.startEffects.map(effect => effect.getInverse())
    }

    static isValid(planet = new Planet(), targetPlanet = new Planet()) {
        //planet must not already be at war with the target planet
        const ratingsValid = planet.culture.militaryRating > 1 //need to actually have enough ships to hurt them
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.War
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.BOMBARDMENT, targetPlanet) || 
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet)
        return ratingsValid && relationshipValid && !interferingEvent
    }
}
