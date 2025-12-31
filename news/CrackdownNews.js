class CrackdownNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Government cracks down on crime on ${coloredName(planet)}!`,
            `The anti-crime crackdown on ${coloredName(planet)} ends with a series of high profile arrests!`,
            `${coloredName(planet)}'s crackdown fails as the syndicates corrupt the very agencies tasked with enforcement!`,
            '',
            NT.CRACKDOWN, planet
        )

        this.addEffect(
            {
                planet: this.planet,
                security: CL.SLIGHTLY_HIGH,
                culture: CL.LOW,
                crime: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.DRUGS, CL.HIGH], [CARGO_TYPES.WEAPONS, CL.HIGH]])),
            },
            {
                security: CL.HIGH,
                crime: CL.LOW,
                corruption: CL.LOW,
            },
            {
                security: CL.SLIGHTLY_LOW,
                crime: CL.HIGH,
                culture: CL.LOW,
                corruption: CL.HIGH,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome(p.c.security*p.c.culture/p.c.crime, CL.LOW) //this usually suceeds
    }

    isValid() {
        const {planet: p} = this
        const crimeValid = (p.c.corruption > CL.HIGH || p.c.crime > CL.HIGH)
        const securityValid = p.c.security < CL.HIGH
        const interferingEvent = News.planetHasAnyNews(p, NT_CRIME_PREVENTING)
        return crimeValid && securityValid && !interferingEvent
    }
}
