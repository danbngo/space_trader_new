class RaidingNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends raiding parties deep into ${coloredName(targetPlanet)}, seeking riches and plunder!`,
            `${coloredName(planet)} ceases its raiding operations against ${coloredName(targetPlanet)}, having satiated its hunger for riches!`,
            `${coloredName(planet)}'s raiders are repelled by ${coloredName(targetPlanet)} after taking heavy losses!`,
            `Peace treaty sees ${coloredName(planet)} end its raids on ${coloredName(targetPlanet)}!`,
            NT.RAIDING, planet, targetPlanet
        )

        const buildingsToDisable = rndMembers(this.targetPlanet.settlement.destroyableBuildings, 1);

        this.addPlanetEffect(
            {
                cargoPriceModifiers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH], [CARGO_TYPES.ANTIMATTER, CL.HIGH]])),
                prestige: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
                army: CL.LOW
            },
            {
                territory: CL.SLIGHTLY_HIGH,
                reserves: CL.HIGH,
                wealth: CL.VERY_HIGH,
                prestige: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
                inflation: CL.VERY_LOW,
                taxes: CL.VERY_LOW
            },
            {
                prestige: CL.LOW,
                navy: CL.SLIGHTLY_LOW,
                army: CL.LOW
            },
            {
                prestige: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                cargoPriceModifiers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH], [CARGO_TYPES.ANTIMATTER, CL.HIGH]])),
                reserves: CL.SLIGHTLY_LOW,
                wealth: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
            },
            {
                buildingsDisabled: buildingsToDisable,
                reserves: CL.LOW,
                wealth: CL.LOW,
                security: CL.LOW,
                economy: CL.LOW,
                prestige: CL.LOW,
                army: CL.LOW
            },
            {
                prestige: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
            },
        )
    }

    shouldCancel() {
        return Civilization.areAlliesOrNeutral(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome((this.planet.c.army/this.targetPlanet.c.military), CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // More likely if military is high and goods are low
        const ratingsValid = p.c.military > CL.SLIGHTLY_HIGH && p.c.wealth < CL.MEDIUM && tp.c.military > CL.HIGH
        const relationshipsValid = Civilization.areAtWar(p, tp)
        return ratingsValid && relationshipsValid
    }
}
