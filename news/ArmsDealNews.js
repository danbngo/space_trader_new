class ArmsDealNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} pursues a major arms purchase from ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s arms deal with ${coloredName(targetPlanet)} is complete!`,
            `${coloredName(targetPlanet)} refuses to sell arms to ${coloredName(planet)} due to their poor reputation!`,
            `${coloredName(planet)} cancels arms deal with ${coloredName(targetPlanet)} due to deteriorating relations!`,
            NT.ARMS_DEAL, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    prestige: CL.SLIGHTLY_LOW,
                })
            }),
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.completeEffects[0].civilizationMultipliers, {
            wealth: CL.LOW, // payment for arms
            army: CL.HIGH, // gain military knowledge
            navy: CL.HIGH, // gain new ships
            technology: CL.SLIGHTLY_HIGH,
        })
        Object.assign(this.completeEffects[1].civilizationMultipliers, {
            wealth: CL.HIGH, // payment received
            navy: CL.LOW, // sold ships
            army: CL.LOW,
        })

        // Failed: seller refuses to sell
        this.failEffects = []

        // Cancelled: deal cancelled midway
        this.cancelEffects = []
    }

    shouldCancel() {
        return (Civilization.areTenseOrAtWar(this.planet, this.targetPlanet))
    }

    determineOutcome() {
        // Fail if targetPlanet refuses to sell - based on planet's low prestige/credits
        // Lower prestige and credits increase the chance seller refuses
        this.rollOutcome(this.planet.civilization.prestige*this.planet.civilization.wealth, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //targetPlanet (seller) needs to have sufficient military to sell
        const ratingsValid = (tp.civilization.navy >= CL.SLIGHTLY_HIGH && tp.civilization.technology > CL.SLIGHTLY_HIGH)
        //seller's military should be larger than purchaser's
        const transferValid = tp.civilization.navy/p.civilization.navy > CL.SLIGHTLY_HIGH && tp.civilization.technology/p.civilization.technology > CL.SLIGHTLY_HIGH
        //both planets must be neutral or allies
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(p, tp, [NT.ARMS_DEAL, ...NT_COOPERATION_PREVENTING])
        return transferValid && ratingsValid && relationshipsValid && !interferingEvent
    }
}
