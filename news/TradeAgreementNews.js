class TradeAgreementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} and ${coloredName(targetPlanet)} sign an expansive trade agreement, benefitting both planets!`,
            `${coloredName(planet)} and ${coloredName(targetPlanet)}'s trade agreement has lapsed!`,
            `Trade negotiations between ${coloredName(planet)} and ${coloredName(targetPlanet)} collapse due to economic instability!`,
            `Rising tensions force ${coloredName(planet)} and ${coloredName(targetPlanet)} to suspend trade agreement!`,
            NT.TRADE_AGREEMENT, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    reserves: CL.HIGH,
                    economy: CL.SLIGHTLY_HIGH,
                    education: CL.HIGH,
                    technology: CL.SLIGHTLY_HIGH,
                    wealth: CL.HIGH
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    reserves: CL.HIGH,
                    economy: CL.SLIGHTLY_HIGH,
                    education: CL.HIGH,
                    technology: CL.SLIGHTLY_HIGH,
                    wealth: CL.HIGH
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Some lingering benefits after
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            economy: CL.SLIGHTLY_HIGH,
            wealth: CL.SLIGHTLY_HIGH
        }))
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            economy: CL.SLIGHTLY_HIGH,
            wealth: CL.SLIGHTLY_HIGH
        }))

        // Failed: economic collapse ruins trade benefits
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            economy: CL.LOW,  // Economic disruption
            wealth: CL.LOW
        }))
        this.failEffects[1].civilizationMultipliers.multiply(new Civilization({
            economy: CL.LOW,
            wealth: CL.LOW
        }))

        // Cancelled: tensions suspend trade early
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            reserves: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            wealth: CL.SLIGHTLY_HIGH
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            reserves: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            wealth: CL.SLIGHTLY_HIGH
        }))
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel for hostile relationships
        const rel1 = p.c.relationships.get(tp)
        const rel2 = tp.c.relationships.get(p)
        return rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.WAR ||
               rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.WAR
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check for economic collapse
        const economyCheck = (p.c.economy < CL.LOW) || (tp.c.economy < CL.LOW)
        if (economyCheck) {
            this.failed = true
        }
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //planets must be neutral or allied towards each other
        const relationships = [p.c.relationships.get(targetPlanet), tp.c.relationships.get(planet)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //dont trade with opposing governments
        const govTypesValid = p.c.governmentType.opposingType !== tp.c.governmentType && tp.c.governmentType.opposingType !== p.c.governmentType
        //trade is only blocked if you're actively hostile to each other. 
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.TRADE_AGREEMENT, ...NT_COOPERATION_PREVENTING])
        return govTypesValid && relationshipsValid && !interferingEvent
    }
}
