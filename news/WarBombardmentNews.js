class WarBombardmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} brings in its heavy bombers and commences orbital bombardment of ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s orbital bombardment of ${coloredName(targetPlanet)} has forced their surrender!`,
            '',
            `${coloredName(planet)}'s bombardment of ${coloredName(targetPlanet)} is halted by peace treaty!`,
            NT.BOMBARDMENT, planet, targetPlanet
        )

        const buildingsToDisable = [];
        const numBuildings = Math.floor(Math.random() * 3) + 1; // 1-3 buildings
        const enabledBuildings = tp.settlement.buildings.filter(b => b.enabled);
        for (let i = 0; i < Math.min(numBuildings, enabledBuildings.length); i++) {
            const building = rndMember(enabledBuildings.filter(b => b.enabled && !buildingsToDisable.includes(b)));
            if (building) buildingsToDisable.push(building);
        }

        this.addPlanetEffect(
            {
                planet: this.planet,
                prestige: CL.HIGH,
                military: CL.SLIGHTLY_LOW
            },
            {},
            {},
            {
                prestige: CL.NO_REGRESSION,
            }
        )

        this.addTargetPlanetEffect(
            {
                population: CL.LOW,
                military: CL.EXTREMELY_LOW,
                technology: CL.LOW,
                buildingsDisabled: buildingsToDisable,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WATER, 2],
                    [CARGO_TYPES.MEDICINE, 2]
                ]))
            },
            {
                population: CL.NO_REGRESSION,
                military: CL.NO_REGRESSION,
                technology: CL.NO_REGRESSION,
                buildingsEnabled: [],
                forcePeace: true
            },
            {},
            {
                population: CL.SLIGHTLY_HIGH,
                military: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_HIGH,
                forcePeace: true
            }
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if peace was forced (relationships changed during bombardment)
        const currentRel1 = p.c.relationships.get(targetPlanet)
        const currentRel2 = tp.c.relationships.get(planet)
        this.cancelled = (currentRel1 !== RELATIONSHIP_TYPES.WAR || currentRel2 !== RELATIONSHIP_TYPES.WAR)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //our military must be significantly stronger than theirs and navy must be MUCH stronger
        const navyAdvantage = p.c.military > tp.c.military * CL.HIGH && p.c.navy > tp.c.navy * CL.VERY_HIGH
        
        const relationshipValid = p.c.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = 
            News.hasNews(NT.BOMBARDMENT, planet, targetPlanet) || 
            News.hasAnyNewsBidirectional(planet, targetPlanet, NT_COOPERATIVE)
        return navyAdvantage && relationshipValid && !interferingEvent
    }
}
