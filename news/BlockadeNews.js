class BlockadeNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} places a blockade around ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)} lifts its blockade on ${coloredName(targetPlanet)}, having devastated their economy!`,
            `${coloredName(planet)}'s blockade on ${coloredName(targetPlanet)} fails as its ships are harassed and bypassed!`,
            `${coloredName(planet)}'s blockade on ${coloredName(targetPlanet)} is recalled as relations improve!`,
            NT.BLOCKADE, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                navy: CL.VERY_LOW,
            },
            {
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                navy: CL.LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                prestige: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                inflation: CL.VERY_HIGH,
                reserves: CL.SLIGHTLY_LOW,
            },
            {
                prestige: CL.SLIGHTLY_LOW,
                economy: CL.LOW,
                inflation: CL.HIGH,
                reserves: CL.LOW,
            },
            {
                prestige: CL.SLIGHTLY_HIGH,
            }
        )
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
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATIVE)
        return ratingsValid && relationshipValid && !interferingEvent
    }
}
