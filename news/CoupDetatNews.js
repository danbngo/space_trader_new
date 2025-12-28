class CoupDetatNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        // Select a random government type for the coup (not puppet state or previous type)
        const availableGovTypes = GT_ALL.filter(
            gov => gov !== GT.PUPPET_STATE && gov !== targetPlanet.culture.governmentType
        )
        const newGovernmentType = availableGovTypes[Math.floor(Math.random() * availableGovTypes.length)]
        super(
            `${coloredName(planet)} orchestrates a coup d'état in ${coloredName(targetPlanet)}, toppling their government!`,
            `${coloredName(planet)}'s coup in ${coloredName(targetPlanet)} succeeds! A new ${coloredName(newGovernmentType)} government is established!`,
            NT.COUP_DETAT, planet, targetPlanet
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
                newGovernmentType: GT.ANARCHY ? null : GT.ANARCHY,
                military: CL.VERY_LOW,
                security: CL.VERY_LOW,
                crime: CL.VERY_HIGH,
                economy: CL.LOW,
                industry: CL.LOW,
                prestige: CL.LOW,
                //credits: CL.VERY_LOW,
                buildingsDisabled: courthouseBuilding ? [courthouseBuilding] : [],
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH]]),
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
            forcePeace: true,
            newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Aggressor must have high prestige, target must have lowER prestige
        const ratingsValid = (planet.culture.prestige > CL.HIGH) && (planet.culture.prestige > (targetPlanet.culture.prestige * CL.HIGH))
        // Target must have opposing government type - nevermind, CIA flouts this all the time
        //const govValid = planet.culture.governmentType.opposingType == targetPlanet.culture.governmentType
        // Must be at least TENSE beforehand
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        const interferingEvent = News.planetHasAnyNews(targetPlanet, [NT.COUP_DETAT, ...NT_CRIME_PREVENTING])
        return ratingsValid && relationshipsValid && !interferingEvent
    }

}
