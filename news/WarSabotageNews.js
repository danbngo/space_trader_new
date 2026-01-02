class WarSabotageNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches a black ops campaign against ${coloredName(targetPlanet)}, going behind enemy lines!`,
            `${coloredName(planet)}'s sabotage campaign against ${coloredName(targetPlanet)} concludes in a terrific series of bombings!`,
            `${coloredName(planet)}'s saboteurs are swiftly rounded up by ${coloredName(targetPlanet)}'s counter-spies and executed!`,
            `${coloredName(planet)}'s sabotage operations against ${coloredName(targetPlanet)} are called off!`,
            NT.WAR_SABOTAGE, planet, targetPlanet
        )

        const buildingsDamaged = rndMembers(targetPlanet.settlement.damagableBuildings, 1, true)

        this.addPlanetEffect(
            {
                security: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW
            },
            {
                security: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW
            },
            {
                security: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW
            },
            {
                wealth: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                industry: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW,
                crime: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_LOW
            },
            {
                buildingsDamaged,
                industry: CL.LOW,
                economy: CL.LOW,
                security: CL.VERY_LOW,
                crime: CL.SLIGHTLY_HIGH,
                technology: CL.LOW,
                navy: CL.SLIGHTLY_LOW
            },
            {},
            {
                security: CL.SLIGHTLY_HIGH
            }
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = Civilization.areAtWar(p, tp)
        // Requires high security to conduct sabotage
        const securityValid = (p.c.security > CL.MEDIUM) && (p.c.security/tp.c.security > CL.MEDIUM)
        return relationshipValid && securityValid
    }
}
