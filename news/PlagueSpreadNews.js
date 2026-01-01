class PlagueSpreadNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `The plague ravaging ${coloredName(planet)} spreads to ${coloredName(targetPlanet)} through trade routes and travel!`,
            `${coloredName(targetPlanet)} successfully quarantines and contains the plague from ${coloredName(planet)}!`,
            `${coloredName(targetPlanet)} fails to stop the plague from ${coloredName(planet)}! The disease spreads rapidly!`,
            `Trade restrictions prevent the plague from spreading further from ${coloredName(planet)}!`,
            NT.PLAGUE_SPREAD, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                prestige: CL.VERY_LOW
            },
            {
                prestige: CL.LOW
            },
            {
                onApply: () => {
                    // On failure, give target planet a plague event
                    const plagueEvent = new PlagueNews(targetPlanet)
                    if (plagueEvent.isValid()) {
                        plagueEvent.start()
                    }
                },
                prestige: CL.LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                economy: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.MEDICINE, CL.VERY_HIGH]]))
            },
            {
                security: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                onApply: () => {
                    // On failure, give target planet a plague event
                    const plagueEvent = new PlagueNews(targetPlanet)
                    if (plagueEvent.isValid()) {
                        plagueEvent.start()
                    }
                },
                prestige: CL.LOW
            }
        )
    }

    shouldCancel() {
        // Cancel if they're no longer trading partners/allies, or if source no longer has plague
        const noLongerAllies = !Civilization.areAlliesOrNeutral(this.planet, this.targetPlanet)
        const sourcePlagueCured = !News.planetHasAnyNews(this.planet, [NT.PLAGUE])
        return noLongerAllies || sourcePlagueCured
    }

    determineOutcome() {
        const {targetPlanet: tp} = this
        // Success (containment) depends on security, technology, and preparedness
        this.rollOutcome(tp.c.security * tp.c.technology * tp.c.education, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Source must have active plague
        const sourcePlague = News.planetHasAnyNews(p, [NT.PLAGUE])
        // Must be trading partners or allies
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        // Target cannot have plague vaccine active
        const hasVaccine = News.planetHasAnyNews(tp, [NT.PLAGUE_VACCINE])
        // Target should not already have plague
        const targetAlreadyPlagued = News.planetHasAnyNews(tp, [NT.PLAGUE])
        
        return sourcePlague && relationshipsValid && !hasVaccine && !targetAlreadyPlagued
    }
}
