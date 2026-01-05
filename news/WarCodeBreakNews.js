class WarCodeBreakNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} is employing a new encryption method that makes its communications impermeable to ${coloredName(planet)}!`,
            `News leaks that ${coloredName(planet)} broke ${coloredName(targetPlanet)}'s encrypted communications and used that to engineer a massive military advantage in one fell swoop!`,
            `${coloredName(planet)}'s military fortunes continue to decrease as they prove unable to decrypt ${coloredName(targetPlanet)}'s new methods!`,
            ``,
            NT.WAR_CODE_BREAK, planet, targetPlanet
        )

        this.addPlanetEffect(
            {},
            {
                security: CL.HIGH,
                army: CL.HIGH,
                navy: CL.HIGH,
                technology: CL.HIGH
            },
            {
                security: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                security: CL.SLIGHTLY_HIGH,
                army: CL.SLIGHTLY_HIGH,
                navy: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH
            },
            {
                security: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW
            },
            {
                security: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Success depends on planet's technology/education vs target's technology
        const aggressorScore = (p.c.technology * p.c.education) * p.objectType.powerMultiplier
        const victimScore = (tp.c.technology * tp.c.technology) * tp.objectType.powerMultiplier
        this.rollOutcome(aggressorScore / victimScore, CL.HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war or tense
        const relationshipsValid = Civilization.areAtWar(p, tp) || Civilization.areTense(p, tp)
        
        // Both need high technology
        const ratingsValid = p.c.technology > CL.SLIGHTLY_HIGH && tp.c.technology > CL.SLIGHTLY_HIGH
        
        return relationshipsValid && ratingsValid
    }
}
