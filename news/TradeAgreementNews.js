class TradeAgreementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} and ${coloredName(targetPlanet)} sign an expansive trade agreement, benefitting both planets!`,
            `${coloredName(planet)} and ${coloredName(targetPlanet)}'s trade agreement has lapsed!`,
            ``,
            `Rising tensions force ${coloredName(planet)} and ${coloredName(targetPlanet)} to suspend trade agreement!`,
            NT.TRADE_AGREEMENT, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                reserves: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.SLIGHTLY_LOW],
                    [CARGO_TYPES.ELECTRONICS, CL.SLIGHTLY_LOW]
                ]))
            },
            {
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            },
            {},
            {
                reserves: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            }
        )

        this.addTargetPlanetEffect(
            {
                reserves: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.HIGH
            },
            {
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            },
            {},
            {
                reserves: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            }
        )
        
        // Exchange culture between trading partners
        this.startEffects[0].onApply = () => {
            if (this.planet instanceof Planet && this.targetPlanet instanceof Planet) {
                this.planet.addCulture(this.targetPlanet, 0.02);
                this.targetPlanet.addCulture(this.planet, 0.02);
            }
        }
    }

    shouldCancel() {
        return Civilization.areTenseOrAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        //never fails
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //planets must be neutral or allied towards each other
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        //dont trade with opposing governments
        const govTypesValid = !Civilization.areOpposingGovernments(p, tp)
        //trade is only blocked if you're actively hostile to each other. 
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        return govTypesValid && relationshipsValid && !interferingEvent
    }
}
