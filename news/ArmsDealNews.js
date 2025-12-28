class ArmsDealNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends a major arms shipment to ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s arms deal with ${coloredName(targetPlanet)} is complete!`,
            NEWS_TYPES.ARMS_DEAL, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                military: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.SLIGHTLY_LOW], [CARGO_TYPES.ANTIMATTER, CL.SLIGHTLY_LOW]]),
                shipyardNumShips: CL.LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                credits: CL.LOW,
                military: CL.HIGH,
                shipyardNumShips: CL.HIGH,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.endEffects[0], {
            military: News.clHalfRegression(this.endEffects[0].military),
            shipyardNumShips: News.clHalfRegression(this.endEffects[0].shipyardNumShips),
            prestige: CL.SLIGHTLY_HIGH,
            credits: CL.HIGH,
        })
        Object.assign(this.endEffects[1], {
            credits: CL.NO_REGRESSION,
            military: News.clHalfRegression(this.endEffects[1].military),
            shipyardNumShips: News.clHalfRegression(this.endEffects[1].shipyardNumShips),
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //need to have sufficient military of our own
        const ratingsValid = planet.culture.military >= CL.HIGH || planet.settlement.shipyard.baseNumShips > CL.HIGH
        //our military should be larger than theirs
        const transferValid = planet.culture.military > targetPlanet.culture.military && planet.settlement.shipyard.baseNumShips > targetPlanet.settlement.shipyard.baseNumShips
        //both planets must be neutral or allies
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL || rel == RELATIONSHIP_TYPES.ALLY)
        const interferingEvent = 
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.ARMS_DEAL, ...NEWS_TYPES_COOPERATION_PREVENTING])
        return transferValid && ratingsValid && relationshipsValid && !interferingEvent
    }
}
