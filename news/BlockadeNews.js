class BlockadeNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} places a blockade around ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)} lifts its blockade on ${coloredName(targetPlanet)}, having devastated their economy!`,
            `${coloredName(planet)}'s blockade on ${coloredName(targetPlanet)} fails as its ships are harassed and bypassed!`,
            `${coloredName(planet)}'s blockade on ${coloredName(targetPlanet)} is recalled as relations improve!`,
            NT.BLOCKADE, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    navy: CL.VERY_LOW,
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                civilizationMultipliers: new Civilization({
                    prestige: CL.SLIGHTLY_LOW,
                    economy: CL.SLIGHTLY_LOW,
                    inflation: CL.VERY_HIGH,
                    reserves: CL.SLIGHTLY_LOW,
                    //cargoPriceModifiers - no need, EVERYTHING is more expensivve
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            prestige: CL.SLIGHTLY_HIGH,
        }))
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            prestige: CL.SLIGHTLY_LOW,
            economy: CL.LOW,
            inflation: CL.HIGH,
            reserves: CL.LOW,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
    }

    shouldCancel() {
        return Civilization.areAlliesOrNeutral(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        // Outcome is handled by shouldCancel()
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //need to have enough ships for it
        const ratingsValid = p.c.navy > CL.MEDIUM && p.c.navy > tp.c.navy * CL.HIGH
        //cant be anarchic or puppet state
        //planet must already be hostile to the target planet
        const relationshipValid = Civilization.areTenseOrAtWar(p, tp)
        const interferingEvent = 
            News.hasNews(NT.BLOCKADE, p, tp) || 
            News.hasAnyNewsBidirectional(p, tp, NT_COOPERATIVE)
        return ratingsValid && relationshipValid && !interferingEvent
    }
}
