class ReligionRevivalNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} has produced a great prophet and is undergoing a religious revival!`,
            `${coloredName(planet)}'s religious movement has integrated with the local culture, enriching it!`,
            `The religious authorities on ${coloredName(planet)} persecute the upstart movement with a heavy hand!`,
            `The religious revival on ${coloredName(planet)} has ceased.`,
            NT.RELIGION_REVIVAL, planet
        )

        this.addPlanetEffect(
            {
                culture: CL.SLIGHTLY_HIGH,
                population: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH],
                    [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.DRUGS, CL.LOW]
                ]))
            },
            {
                population: CL.HIGH,
                education: CL.SLIGHTLY_LOW,
                culture: CL.VERY_HIGH,
                corruption: CL.EXTREMELY_LOW,
            },
            {
                population: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_LOW,
                culture: CL.LOW,
                security: CL.LOW,
                corruption: CL.SLIGHTLY_HIGH
            }
        )
    }

    isValid() {
        const {planet: p} = this
        //tends to happen when culture is at a low point or corruption is very high
        const ratingsValid = p.c.culture < CL.LOW || p.c.corruption > CL.VERY_HIGH
        return ratingsValid
    }

    shouldCancel() {
        const {planet: p} = this
        return p.c.governmentType === GT.TECHNOCRACY
    }
}
