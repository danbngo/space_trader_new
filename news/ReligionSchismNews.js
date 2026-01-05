class ReligionSchismNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `A religious schism erupts between ${coloredName(planet)} and ${coloredName(targetPlanet)} over differing interpretations of ${colorSpan(planet.c.stateReligion?.name || 'their faith', planet.c.stateReligion?.color || COLORS.White)}!`,
            `The religious schism between ${coloredName(planet)} and ${coloredName(targetPlanet)} subsides as both sides agree to disagree!`,
            '',
            `The religious schism between ${coloredName(planet)} and ${coloredName(targetPlanet)} is overshadowed by other events!`,
            NT.RELIGION_SCHISM, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.TENSE,
                culture: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH], [CARGO_TYPES.WEAPONS, CL.HIGH]]))
            },
            {
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_LOW], [CARGO_TYPES.WEAPONS, CL.LOW]])), // Invert temporary price increases
                onApply: () => {
                    if (this.planet.c.relationships.get(this.targetPlanet) == RELATIONSHIP_TYPES.TENSE) {
                        this.planet.c.relationships.set(this.targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
                    }
                }
            }
        )

        this.addTargetPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.TENSE,
                culture: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH], [CARGO_TYPES.WEAPONS, CL.HIGH]]))
            },
            {
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_LOW], [CARGO_TYPES.WEAPONS, CL.LOW]])), // Invert temporary price increases
                onApply: () => {
                    if (this.targetPlanet.c.relationships.get(this.planet) == RELATIONSHIP_TYPES.TENSE) {
                        this.targetPlanet.c.relationships.set(this.planet, RELATIONSHIP_TYPES.NEUTRAL)
                    }
                }
            }
        )

        // Set up cancelEffects to remove cargo price modifiers
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_LOW], [CARGO_TYPES.WEAPONS, CL.LOW]])),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.VERY_LOW], [CARGO_TYPES.WEAPONS, CL.LOW]])),
            })
        ]
    }

    shouldCancel() {
        return !Civilization.areTense(this.planet, this.targetPlanet) || 
               this.planet.c.stateReligion !== this.targetPlanet.c.stateReligion
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this

        // Both must share the same state religion
        if (!p.c.stateReligion || !tp.c.stateReligion) return false
        if (p.c.stateReligion !== tp.c.stateReligion) return false

        // Must be neutral or allies currently
        const relationshipsValid = Civilization.areNeutral(p, tp) || Civilization.areAllies(p, tp)

        // Both should have significant religious presence
        const planetValid = p.c.culture > CL.SLIGHTLY_LOW
        const targetValid = tp.c.culture > CL.SLIGHTLY_LOW

        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.RELIGION_SCHISM, NT.TENSIONS, ...NT_COOPERATIVE])

        return relationshipsValid && planetValid && targetValid && !interferingEvent
    }
}
