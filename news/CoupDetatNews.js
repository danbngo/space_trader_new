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
                prestige: CL.LOW,
                taxes: CL.LOW,
                corruption: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.ASTRONOMICAL]])),
            },
            {
                prestige: CL.LOW,
                taxes: CL.LOW,
                corruption: CL.HIGH,
            },
            {
                prestige: CL.VERY_LOW,
                wealth: CL.LOW,
                corruption: CL.HIGH,
            }
        )

        this.addTargetPlanetEffect(
            {
                governmentType: GT.ANARCHY ? null : GT.ANARCHY,
                army: CL.VERY_LOW,
                navy: CL.VERY_LOW,
                security: CL.VERY_LOW,
                corruption: CL.HIGH,
                economy: CL.LOW,
                industry: CL.LOW,
                prestige: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.ASTRONOMICAL]])),
            },
            {
                forcePeace: true,
                newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
                governmentType,
                military: rng(0.5,2,false),
                navy: rng(0.5,2,false),
                economy: rng(0.5,2,false),
                security: rng(0.5,2,false),
                education: rng(0.5,2,false),
                corruption: rng(0.5,2,false),
                culture: rng(0.5,2,false),
                taxes: rng(0.5,2,false),
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

    shouldCancel() {
        const {targetPlanet: tp} = this
        // Coup cancelled if target becomes puppet state (already under external control)
        return tp.c.governmentType === GT.PUPPET_STATE
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
