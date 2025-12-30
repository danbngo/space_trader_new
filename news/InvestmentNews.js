class InvestmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends a massive economic investment to ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s economic investment in ${coloredName(targetPlanet)} is complete!`,
            `${coloredName(planet)}'s investment in ${coloredName(targetPlanet)} collapses due to mismanagement!`,
            `Tensions force ${coloredName(planet)} to pull investment from ${coloredName(targetPlanet)}!`,
            NT.INVESTMENT, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                wealth: CL.LOW,
                reserves: CL.VERY_LOW,
                navy: CL.VERY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                reserves: CL.VERY_HIGH,
                wealth: CL.HIGH,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.completeEffects[0], {
            wealth: News.clHalfRegression(this.completeEffects[0].wealth),
            reserves: News.clHalfRegression(this.completeEffects[0].reserves),
            prestige: CL.SLIGHTLY_HIGH,
        })
        Object.assign(this.completeEffects[1], {
            industry: CL.VERY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
            navy: CL.SLIGHTLY_HIGH,
        })

        // Failed: investment collapses, money lost
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                wealth: CL.NO_REGRESSION, // money lost
                prestige: CL.LOW, // investment failure
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                economy: CL.LOW, // economic disruption
                industry: News.clHalfRegression(CL.VERY_HIGH), // partial development
            })
        ]

        // Cancelled: investment withdrawn early
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                wealth: News.clHalfRegression(CL.LOW),
                reserves: News.clHalfRegression(CL.VERY_LOW),
                prestige: News.clHalfRegression(CL.SLIGHTLY_HIGH),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                reserves: News.clHalfRegression(CL.VERY_HIGH),
                wealth: News.clHalfRegression(CL.HIGH),
                industry: News.clHalfRegression(CL.VERY_HIGH),
                economy: News.clHalfRegression(CL.SLIGHTLY_HIGH),
            })
        ]
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if relationship deteriorated
        const rel1 = planet.civilization.relationships.get(targetPlanet)
        const rel2 = targetPlanet.civilization.relationships.get(planet)
        if (rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.WAR ||
            rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.WAR) {
            this.cancelled = true
            return
        }
        // Investment fails if target has poor governance
        const failProbability = (1 - targetPlanet.civilization.economy) * (1 - targetPlanet.civilization.security) * 0.35
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet, targetPlanet} = this
        //need to have sufficient economy of our own
        const ratingsValid = planet.civilization.wealth >= CL.SLIGHTLY_HIGH || planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE > CL.SLIGHTLY_HIGH
        //our economy should be larger than theirs
        const transferValid = planet.civilization.economy > targetPlanet.civilization.economy && planet.settlement.bank.baseCredits > targetPlanet.settlement.bank.baseCredits && planet.settlement.market.baseCargo.average > targetPlanet.settlement.market.baseCargo.average
        //both planets must be neutral or allies
        const relationships = [planet.civilization.relationships.get(targetPlanet), targetPlanet.civilization.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL || rel == RELATIONSHIP_TYPES.ALLY)
        //removed most of the requirements for this, can we not have like a marshall plan??
        const interferingEvent = 
            News.hasNews(NT.INVESTMENT, planet, targetPlanet)
        return transferValid && ratingsValid && relationshipsValid && !interferingEvent
    }
}
