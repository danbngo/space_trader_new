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
                army: CL.SLIGHTLY_LOW, //but expends some of your arsenal
                navy: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                population: CL.LOW,
                army: CL.EXTREMELY_LOW,
                navy: CL.EXTREMELY_LOW,
                industry: CL.LOW,
                economy: CL.LOW,
                security: CL.LOW,
                reserves: CL.LOW,
                inflation: CL.EXTREMELY_HIGH,
                technology: CL.LOW, //back to the stone age!
                education: CL.LOW,
                prestige: CL.VERY_LOW,
                buildingsDisabled: buildingsToDisable,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WATER, 2], [CARGO_TYPES.MEDICINE, 2], [CARGO_TYPES.HOLOCUBES, 0.5]])), //this is the only thing that normalizes after
            })
        ]

        //dont automatically recover. lets add recovery events elsewhere
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[1], {
            population: CL.NO_REGRESSION,
            army: CL.NO_REGRESSION,
            navy: CL.NO_REGRESSION,
            industry: CL.NO_REGRESSION,
            economy: CL.NO_REGRESSION,
            security: CL.NO_REGRESSION,
            reserves: CL.NO_REGRESSION,
            technology: CL.NO_REGRESSION,
            education: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION,
            buildingsEnabled: [],
            forcePeace: true,
        })

        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                prestige: CL.NO_REGRESSION,
                army: News.clHalfRegression(this.completeEffects[0].army),
                navy: News.clHalfRegression(this.completeEffects[0].navy),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                population: News.clHalfRegression(this.completeEffects[1].population),
                army: News.clHalfRegression(this.completeEffects[1].army),
                navy: News.clHalfRegression(this.completeEffects[1].navy),
                industry: News.clHalfRegression(this.completeEffects[1].industry),
                economy: News.clHalfRegression(this.completeEffects[1].economy),
                security: News.clHalfRegression(this.completeEffects[1].security),
                forcePeace: true,
            })
        ]
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if peace was forced (relationships changed during bombardment)
        const currentRel1 = planet.c.relationships.get(targetPlanet)
        const currentRel2 = targetPlanet.c.relationships.get(planet)
        this.cancelled = (currentRel1 !== RELATIONSHIP_TYPES.WAR || currentRel2 !== RELATIONSHIP_TYPES.WAR)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //our military must be significantly stronger than theirs and navy must be MUCH stronger
        const navyAdvantage = planet.c.military > targetPlanet.c.military * CL.HIGH && planet.c.navy > targetPlanet.c.navy * CL.VERY_HIGH
        
        const relationshipValid = planet.c.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = 
            News.hasNews(NT.BOMBARDMENT, planet, targetPlanet) || 
            News.hasAnyNewsBidirectional(planet, targetPlanet, NT_COOPERATIVE)
        return navyAdvantage && relationshipValid && !interferingEvent
    }
}
