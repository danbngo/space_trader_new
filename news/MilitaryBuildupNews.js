class MilitaryBuildupNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins a massive military buildup!`,
            `${coloredName(planet)}'s military buildup is complete! They host a grand military parade!`,
            NEWS_TYPES.MILITARY_BUILDUP, planet
        )
        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.LOW,
                industry: CL.LOW,
                marketCargoAmounts: CL.LOW,
                credits: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH], [CARGO_TYPES.ANTIMATTER, 2]]),
            })
        ]

        //military effect is permanent
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
                military: CL.EXTREMELY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                officerQuality: CL.HIGH,
                guildNumOfficers: CL.HIGH,
                credits: CL.NO_REGRESSION, //so is wasting money
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
        })
    }
    isValid() {
        const {planet} = this
        //dont do it if military is already big
        const ratingsValid = (planet.culture.military < CL.MEDIUM) && (planet.culture.prestige < CL.VERY_HIGH)
        //dont do it if no government are tense with us or vice versa
        let politicsValid = false
        for (const p of gs.system.planets) {
            if (p !== planet) {
                const relationship = planet.culture.relationships.get(p)
                const relationship2 = p.culture.relationships.get(planet)
                if (relationship == RELATIONSHIP_TYPES.TENSE || relationship2 == RELATIONSHIP_TYPES.TENSE) {
                    politicsValid = true
                    break
                }
            }
        }
        //planet must not already be in anarchy or puppet state
        const validGov = planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE
        //removed most requirements for this, even juntas do this on a whim
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.MILITARY_BUILDUP]) 
        return ratingsValid && validGov && !interferingEvent
    }
}
