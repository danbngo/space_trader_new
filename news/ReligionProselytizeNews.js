class ReligionProselytizeNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Missionaries from ${coloredName(planet)} spread ${colorSpan(planet.c.stateReligion?.name || 'their faith', planet.c.stateReligion?.color || COLORS.White)} to ${coloredName(targetPlanet)} through cultural exchange!`,
            `${coloredName(targetPlanet)} embraces ${colorSpan(planet.c.stateReligion?.name || 'the new faith', planet.c.stateReligion?.color || COLORS.White)}, strengthening cultural ties with ${coloredName(planet)}!`,
            `${coloredName(targetPlanet)} rejects missionary efforts from ${coloredName(planet)}, straining relations!`,
            ``,
            NT.RELIGION_PROSELYTIZE, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                prestige: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.HIGH,
                culture: CL.HIGH,
            },
            {
                prestige: CL.SLIGHTLY_LOW,
            }
        )

        this.addTargetPlanetEffect(
            {
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                onApply: () => {
                    // On success, add the proselytizing religion to target (or increase its proportion)
                    if (planet.c.stateReligion) {
                        const currentAmount = targetPlanet.c.religions.getAmount(planet.c.stateReligion) || 0
                        targetPlanet.c.religions.setAmount(planet.c.stateReligion, currentAmount + 0.15)
                    }
                    // Missionaries also spread culture
                    if (targetPlanet instanceof Planet) {
                        targetPlanet.addCulture(planet, 0.02);
                    }
                },
                culture: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.SLIGHTLY_LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Success depends on cultural strength and existing religious tolerance
        const aggressorScore = (p.c.culture * p.c.prestige) * p.objectType.powerMultiplier
        const victimScore = tp.c.culture * tp.objectType.powerMultiplier
        this.rollOutcome(aggressorScore / victimScore, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Requires a state religion and good relations
        const hasStateReligion = p.c.stateReligion !== null
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        const differentReligions = p.c.stateReligion !== tp.c.stateReligion
        const ratingsValid = p.c.culture > CL.MEDIUM
        const interferingEvent = News.hasNews(NT.RELIGION_PROSELYTIZE, p, tp)
        return hasStateReligion && relationshipsValid && differentReligions && ratingsValid && !interferingEvent
    }
}
