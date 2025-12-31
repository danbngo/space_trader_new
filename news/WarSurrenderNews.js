class WarSurrenderNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} sues for peace with ${coloredName(planet)}, offering indemnity and territorial concessions!`,
            `${coloredName(targetPlanet)} has negotiated the terms of its surrender to ${coloredName(planet)}!`,
            `Peace negotiations collapse as ${coloredName(targetPlanet)} rejects surrender terms from ${coloredName(planet)}!`,
            `Events make the surrender of ${coloredName(targetPlanet)} to ${coloredName(planet)} irrelevant!`,
            NT.WAR_SURRENDER, planet, targetPlanet
        )

        this.addPlanetEffect(
            {},
            {
                prestige: CL.HIGH,
                territory: CL.HIGH,
                wealth: CL.HIGH
            }
        )

        this.addTargetPlanetEffect(
            {
                prestige: CL.LOW,
            },
            {
                territory: CL.LOW,
                prestige: CL.LOW,
                wealth: CL.LOW,
                forcePeace: true
            },
            {},
            {
                prestige: CL.SLIGHTLY_HIGH,
            }
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        //could fail if everyone really hates us
        this.rollOutcome(this.planet.c.prestige * this.planet.c.military / this.targetPlanet.c.military, CL.EXTREMELY_LOW)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = Civilization.areAtWar(p, tp)
        // Target should be significantly weaker (losing the war)
        const militaryValid = p.c.military/tp.c.military > CL.HIGH
        return relationshipValid && militaryValid
    }
}
