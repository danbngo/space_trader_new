class CoupDetatNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        // Select a random government type for the coup (not puppet state or previous type)
        const availableGovTypes = GOVERNMENT_TYPES_ALL.filter(
            gov => gov !== GOVERNMENT_TYPES.PUPPET_STATE && gov !== targetPlanet.culture.governmentType
        )
        const newGovernmentType = availableGovTypes[Math.floor(Math.random() * availableGovTypes.length)]
        super(
            `${coloredName(planet)} orchestrates a coup d'état in ${coloredName(targetPlanet)}, toppling their government!`,
            `${coloredName(planet)}'s coup in ${coloredName(targetPlanet)} succeeds! A new ${coloredName(newGovernmentType)} government is established!`,
            NEWS_TYPES.COUP_DETAT, planet, targetPlanet
        )

        const courthouseBuilding = targetPlanet.settlement.courthouse;

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
                prestige: CL.LOW,
                credits: CL.LOW, // funding the coup is expensive
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                newGovernmentType: GOVERNMENT_TYPES.ANARCHY ? null : GOVERNMENT_TYPES.ANARCHY,
                military: CL.VERY_LOW,
                security: CL.VERY_LOW,
                crime: CL.VERY_HIGH,
                economy: CL.LOW,
                industry: CL.LOW,
                //credits: CL.VERY_LOW,
                buildingsDisabled: courthouseBuilding ? [courthouseBuilding] : [],
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH]]),
                //relationsReset: true
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Instigator: prestige boost persists
        Object.assign(this.endEffects[0], {
            prestige: CL.NO_REGRESSION,
            credits: CL.NO_REGRESSION,
        })
        // Target: government stabilizes but some damage lingers
        Object.assign(this.endEffects[1], {
            military: (rng(0.5,1.5,false) + this.endEffects[0].military)/2,
            security: (rng(0.5,1.5,false)  + this.endEffects[0].security)/2,
            industry: (rng(0.5,1.5,false)  + this.endEffects[0].industry)/2,
            credits: (rng(0.5,1.5,false)  + this.endEffects[0].credits)/2,
            prestige: (rng(0.5,1.5,false)  + this.endEffects[0].prestige)/2,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Aggressor must have high prestige, target must have low prestige
        const ratingsValid = planet.culture.prestige > CL.HIGH && targetPlanet.culture.prestige < CL.MEDIUM
        // Target must have opposing government type
        const govValid = planet.culture.governmentType.opposingType === targetPlanet.culture.governmentType
        // Must be TENSE beforehand
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.TENSE && targetPlanet.culture.relationships.get(planet) == RELATIONSHIP_TYPES.TENSE
        const interferingEvent = News.planetHasAnyNews(targetPlanet, [NEWS_TYPES.COUP, ...NEWS_TYPES_CRIME_PREVENTING])
        return ratingsValid && govValid && relationshipValid && !interferingEvent
    }

}
