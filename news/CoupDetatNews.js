class CoupDetatNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        // Select a random government type for the coup (not puppet state or previous type)
        const availableGovTypes = GT_ALL.filter(
            gov => gov !== GT.PUPPET_STATE && gov !== targetPlanet.c.governmentType
        )
        const newGovernmentType = availableGovTypes[Math.floor(Math.random() * availableGovTypes.length)]
        super(
            `${coloredName(planet)} orchestrates a coup attempt in ${coloredName(targetPlanet)}! Guerillas invade the capital!`,
            `${coloredName(planet)}'s coup in ${coloredName(targetPlanet)} succeeds! A new ${newGovernmentType.name} government is established!`,
            `${coloredName(planet)}'s coup attempt in ${coloredName(targetPlanet)} is crushed by loyalist forces!`,
            ``,
            NT.COUP_DETAT, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                //newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
                civilizationMultipliers: new Civilization({
                    prestige: CL.LOW,
                    wealth: CL.LOW, // funding the coup is expensive
                    corruption: CL.HIGH,
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                newGovernmentType: GT.ANARCHY ? null : GT.ANARCHY,
                civilizationMultipliers: new Civilization({
                    army: CL.VERY_LOW,
                    navy: CL.VERY_LOW,
                    security: CL.VERY_LOW,
                    corruption: CL.HIGH,
                    economy: CL.LOW,
                    industry: CL.LOW,
                    prestige: CL.LOW,
                    //wealth: CL.VERY_LOW,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.ASTRONOMICAL]])),
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Instigator: prestige boost persists
        Object.assign(this.completeEffects[0], {
            prestige: CL.NO_REGRESSION,
            wealth: CL.NO_REGRESSION,
            corruption: CL.NO_REGRESSION,
        })
        // Target: government stabilizes but some damage lingers
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            army: rng(0.5,1.5,false),
            navy: rng(0.5,1.5,false),
            security: rng(0.5,1.5,false),
            industry: rng(0.5,1.5,false),
            wealth: rng(0.5,1.5,false),
            prestige: rng(0.5,1.5,false),
        }))
        Object.assign(this.completeEffects[1], {
            forcePeace: true,
            newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
            newGovernmentType
        })

        // Failed: coup crushed, instigator embarrassed
        this.failEffects = this.startEffects.map(fx => fx.getInverse())
        Object.assign(this.failEffects[0], {
            prestige: CL.VERY_LOW/CL.LOW, // international humiliation
            wealth: CL.NO_REGRESSION, // wasted funds
            corruption: CL.NO_REGRESSION,
        })
        Object.assign(this.failEffects[1], {
            prestige: CL.HIGH/CL.LOW,
            security: CL.HIGH, //you did just crush a buncha rebels
        })
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Coup fails if target has high security or military
        this.rollOutcome((tp.c.security + tp.c.army + tp.c.culture) / 3, CL.SLIGHTLY_LOW)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Aggressor must have high prestige, target must have lowER prestige
        const ratingsValid = (p.c.prestige > CL.HIGH) && (p.c.security > CL.MEDIUM) && (p.c.security > tp.c.security)
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        const interferingEvent = News.planetHasAnyNews(tp, NT_CRIME_PREVENTING)
        return ratingsValid && relationshipsValid && !interferingEvent
    }

}
