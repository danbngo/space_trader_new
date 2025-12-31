class CoupDetatNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        // Select a random government type for the coup (not puppet state or previous type)
        const availableGovTypes = GT_ALL.filter(
            gov => gov !== GT.PUPPET_STATE && gov !== targetPlanet.c.governmentType
        )
        const governmentType = availableGovTypes[Math.floor(Math.random() * availableGovTypes.length)]
        super(
            `${coloredName(planet)} orchestrates a coup attempt in ${coloredName(targetPlanet)}! Guerillas invade the capital!`,
            `${coloredName(planet)}'s coup in ${coloredName(targetPlanet)} succeeds! A new ${governmentType.name} government is established!`,
            `${coloredName(planet)}'s coup attempt in ${coloredName(targetPlanet)} is crushed by loyalist forces!`,
            ``,
            NT.COUP_DETAT, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                prestige: CL.LOW,
                corruption: CL.HIGH,
            },
            {
                prestige: CL.NO_REGRESSION,
                corruption: CL.NO_REGRESSION,
            },
            {
                prestige: CL.VERY_LOW,
                corruption: CL.LOW,
            }
        )

        this.addTargetPlanetEffect(
            {
                governmentType: GT.ANARCHY ? null : GT.ANARCHY,
                army: CL.VERY_LOW,
                security: CL.VERY_LOW,
                corruption: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.ASTRONOMICAL]])),
            },
            {
                forcePeace: true,
                targetPlanet: this.planet,
                newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
                governmentType,
                security: rng(0.5,1.5,false),
                corruption: rng(0.5,1.5,false),
            },
            {
                prestige: CL.HIGH,
                security: CL.HIGH,
            }
        )
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
