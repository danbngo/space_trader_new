class WarBombardmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} brings in its heavy bombers and commences orbital bombardment of ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s orbital bombardment of ${coloredName(targetPlanet)} has forced their surrender!`,
            `${coloredName(planet)}'s bombers are repelled by ${coloredName(targetPlanet)}'s fighters and orbital defenses!`,
            `${coloredName(planet)}'s bombardment of ${coloredName(targetPlanet)} is halted by peace treaty!`,
            NT.BOMBARDMENT, planet, targetPlanet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.destroyableBuildings);

        this.addPlanetEffect(
            {
                navy: CL.LOW,
                reserves: CL.SLIGHTLY_LOW,
            },
            {
                navy: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                prestige: CL.HIGH
            },
            {
                navy: CL.LOW,
                reserves: CL.SLIGHTLY_LOW,
            },
        )

        this.addTargetPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW,
                military: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WATER, CL.ASTRONOMICAL],
                    [CARGO_TYPES.FOOD, CL.ASTRONOMICAL],
                    [CARGO_TYPES.MEDICINE, CL.ASTRONOMICAL]
                ]))
            },
            {
                population: CL.LOW,
                military: CL.EXTREMELY_LOW,
                navy: CL.LOW,
                technology: CL.LOW, //back to the stone age!
                education: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                buildingsDisabled: buildingsToDisable,
                forcePeace: true
            },
            {},
            {
                population: CL.SLIGHTLY_LOW,
                military: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
            }
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.navy * this.planet.c.technology * this.planet.c.reserves
            / this.targetPlanet.c.navy / this.targetPlanet.c.technology, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //our military must be significantly stronger than theirs and navy must be MUCH stronger
        const navyAdvantage = p.c.navy > tp.c.navy * CL.HIGH
        const relationshipsValid = Civilization.areAtWar(p, tp)
        return navyAdvantage && relationshipsValid
    }
}
