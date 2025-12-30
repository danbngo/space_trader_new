class CrackdownNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Government cracks down on crime on ${coloredName(planet)}!`,
            `The anti-crime crackdown on ${coloredName(planet)} ends with a series of high profile arrests!`,
            `${coloredName(planet)}'s crackdown fails as the syndicates corrupt the very agencies tasked with enforcement!`,
            '',
            NT.CRACKDOWN, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                security: CL.SLIGHTLY_HIGH,
                culture: CL.LOW,
                crime: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.DRUGS, CL.HIGH], [CARGO_TYPES.WEAPONS, CL.HIGH]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering crime decrease
        Object.assign(this.completeEffects[0], {
            security: CL.HIGH/CL.SLIGHTLY_HIGH,
            crime: CL.LOW/CL.SLIGHTLY_LOW,
            corruption: CL.LOW/CL.SLIGHTLY_LOW,
        })

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.failEffects[0], {
            security: CL.SLIGHTLY_LOW/CL.SLIGHTLY_HIGH,
            crime: CL.HIGH/CL.SLIGHTLY_LOW,
            corruption: CL.HIGH/CL.SLIGHTLY_LOW,
            prestige: CL.SLIGHTLY_LOW
        })
    }

    determineOutcome() {
        const {planet} = this
        this.rollOutcome(planet.civilization.security*planet.civilization.culture/planet.settlement.cryme, CL.LOW) //this usually suceeds
    }

    isValid() {
        const {planet} = this
        const crimeValid = (planet.settlement.corruption > CL.HIGH || planet.settlement.cryme > CL.HIGH)
        const securityValid = planet.civilization.security < CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.CRACKDOWN, ...NT_CRIME_PREVENTING])
        return crimeValid && securityValid && !interferingEvent
    }
}
