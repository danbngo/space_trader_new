class MilitaryBuildupNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins a massive military buildup!`,
            `${coloredName(planet)}'s military buildup is complete!`,
            NEWS_TYPES.MILITARY_BUILDUP, planet
        )
        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                commerceModifiedBy: 0.7,
                industryModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 0.8,
                creditsModifiedBy: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, 1.5], [CARGO_TYPES.ANTIMATTER, 2]]),
            })
        ]

        //military effect is permanent
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
                militaryModifiedBy: 1.4,
                prestigeModifiedBy: 1.1,
                officerQualityModifiedBy: 1.2,
                guildNumOfficersModifiedBy: 1.2,
                creditsModifiedBy: 1, //so is wasting money
        })
    }
    isValid() {
        const {planet} = this
        //dont do it if military is already big
        const ratingsValid = planet.culture.military < 0.75
        //dont do it if no government are tense with us or vice versa
        let politicsValid = false
        for (const p of gs.system.planets) {
            if (p !== planet) {
                const relationship = planet.culture.relationships.get(p)
                const relationship2 = p.culture.relationships.get(planet)
                if (relationship == RELATIONSHIP_TYPES.HOSTILE || relationship2 == RELATIONSHIP_TYPES.HOSTILE) {
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
