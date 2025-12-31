class DisarmamentNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} seeks system-wide peace and begins a period of disarmament!`,
            `${coloredName(planet)}'s disarmament period comes to an end!`,
            ``,
            `External threats force ${coloredName(planet)} to abandon disarmament prematurely!`,
            NT.DISARMAMENT, planet
        )

        this.addPlanetEffect(
            {
                army: CL.LOW,
                navy: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW], [CARGO_TYPES.WEAPONS, CL.EXTREMELY_LOW]])),
            },
            {
                army: CL.VERY_LOW,
                navy: CL.VERY_LOW,
                economy: CL.SLIGHTLY_HIGH,
            }
        )
    }

    shouldCancel() {
        const {planet: p} = this
        const interferingEvent = News.planetHasAnyNewsTargeting(p, NT_MARTIAL) || News.planetHasAnyNews(p, NT_MARTIAL)
        return interferingEvent !== null && interferingEvent !== undefined
    }

    isValid() {
        const {planet: p} = this
        //unlikely if planet has a low military already
        const ratingsValid = (p.c.army > CL.HIGH) && (p.c.navy > CL.HIGH)
        //you cant be at war
        const interferingEvent = News.planetHasAnyNewsTargeting(p, NT_MARTIAL) || News.planetHasAnyNews(p, NT_MARTIAL)
        return ratingsValid && !interferingEvent
    }
}
