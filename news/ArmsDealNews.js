class ArmsDealNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} pursues a major arms purchase from ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s arms deal with ${coloredName(targetPlanet)} is complete!`,
            `${coloredName(targetPlanet)} refuses to sell arms to ${coloredName(planet)} due to their poor reputation!`,
            `${coloredName(planet)} cancels arms deal with ${coloredName(targetPlanet)} due to deteriorating relations!`,
            NT.ARMS_DEAL, planet, targetPlanet
        )

        this.addPlanetEffect({
            taxes: CL.HIGH
        }, {
            army: CL.HIGH, // gain military knowledge
            navy: CL.HIGH, // gain new ships
            reserves: CL.HIGH,
            technology: CL.SLIGHTLY_HIGH,
            taxes: CL.VERY_HIGH,
        }, {
            prestige: CL.SLIGHTLY_LOW,
        })
        
        this.addTargetPlanetEffect({}, {
            wealth: CL.HIGH, // payment received
            navy: CL.LOW, // sold ships
            army: CL.LOW,
        })
    }

    shouldCancel() {
        return (Civilization.areTenseOrAtWar(this.planet, this.targetPlanet))
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.prestige*this.planet.c.taxes, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        const ratingsValid = 
        //targetPlanet (seller) needs to have sufficient military to sell
            (tp.c.navy >= CL.SLIGHTLY_HIGH || tp.c.army > CL.SLIGHTLY_HIGH) && (tp.c.technology > CL.SLIGHTLY_HIGH)
        //seller's military should be larger than purchaser's
            && (tp.c.navy/p.c.navy > CL.SLIGHTLY_HIGH || tp.c.army/p.c.army > CL.SLIGHTLY_HIGH) && tp.c.technology/p.c.technology > CL.SLIGHTLY_HIGH
        //gotta have enough taxes to buy
            && (p.c.taxes > CL.MEDIUM)
        //both planets must be neutral or allies
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
