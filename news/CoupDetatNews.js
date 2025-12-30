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
                prestige: CL.SLIGHTLY_LOW,
                wealth: CL.LOW, // funding the coup is expensive
                crime: CL.LOW, //gotta arm them
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                newGovernmentType: GT.ANARCHY ? null : GT.ANARCHY,
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
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Instigator: prestige boost persists
        Object.assign(this.completeEffects[0], {
            prestige: CL.NO_REGRESSION,
            wealth: CL.NO_REGRESSION,
            crime: CL.NO_REGRESSION,
        })
        // Target: government stabilizes but some damage lingers
        Object.assign(this.completeEffects[1], {
            army: (rng(0.5,1.5,false) + this.completeEffects[1].army)/2,
            navy: (rng(0.5,1.5,false) + this.completeEffects[1].navy)/2,
            security: (rng(0.5,1.5,false)  + this.completeEffects[1].security)/2,
            industry: (rng(0.5,1.5,false)  + this.completeEffects[1].industry)/2,
            wealth: (rng(0.5,1.5,false)  + this.completeEffects[1].wealth)/2,
            prestige: (rng(0.5,1.5,false)  + this.completeEffects[1].prestige)/2,
            forcePeace: true,
            newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
            newGovernmentType
        })

        // Failed: coup crushed, instigator embarrassed
        this.failEffects = this.startEffects.map(fx => fx.getInverse())
        Object.assign(this.failEffects[0], {
            prestige: CL.LOW, // international humiliation
            wealth: CL.NO_REGRESSION, // wasted funds
            crime: CL.NO_REGRESSION,
        })
        Object.assign(this.failEffects[1], {
            prestige: CL.HIGH/CL.LOW //also reverse the effect from the start effect
        })
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Coup fails if target has high security or military
        const resistanceProbability = (targetPlanet.c.security + targetPlanet.c.military) / 2
        const failProbability = resistanceProbability * 0.4
        this.failed = Math.random() < failProbability
        this.rollOutcome((planet.c.security+planet.settlement.cryme)/(targetPlanet.c.security + targetPlanet.c.military), CL.HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Aggressor must have high prestige, target must have lowER prestige
        const ratingsValid = (planet.c.prestige > CL.HIGH) && (planet.c.security > CL.MEDIUM) && (planet.c.security > targetPlanet.c.security)
        // Target must have opposing government type - nevermind, CIA flouts this all the time
        //const govValid = planet.c.governmentType.opposingType == targetPlanet.c.governmentType
        // Must be at least TENSE beforehand
        const relationships = [planet.c.relationships.get(targetPlanet), targetPlanet.c.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        const interferingEvent = News.planetHasAnyNews(targetPlanet, [NT.COUP_DETAT, ...NT_CRIME_PREVENTING])
        return ratingsValid && relationshipsValid && !interferingEvent
    }

}
