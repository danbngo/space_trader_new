class SurplusNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s deep mining efforts have uncovered a new rich vein of resources! Low priced goods are flooding their markets!`,
            `${coloredName(planet)} carefully manages the surplus from its new resource veins, ensuring that benefits accrue to all sectors of its economy!`,
            `${coloredName(planet)}'s resource boom collapses as reserves are exhausted!`,
            ``,
            NT.SURPLUS, planet
        )

        this.addPlanetEffect(
            {
                reserves: CL.EXTREMELY_HIGH,
                industry: CL.HIGH,
                economy: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.METAL, CL.EXTREMELY_LOW], [CARGO_TYPES.WATER, CL.EXTREMELY_LOW], [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_LOW]]))
            },
            {
                industry: CL.SLIGHTLY_HIGH,
                reserves: CL.SLIGHTLY_HIGH,
            },
        )
    }

    determineOutcome() {
        // Surplus succeeds most of the time
        this.rollOutcome(0.85)
    }

    isValid() {
        const {planet: p} = this
        //we needed to be resource scarce to be looking for them so hard
        const ratingsValid = p.c.reserves < CL.MEDIUM
        
        // More likely to find resources on geologically active worlds
        const geologyBonus = !p.climate.geologicalActivity || 
            p.climate.geologicalActivity.value >= GEOLOGICAL_ACTIVITIES.SLIGHTLY_LOW.value
        
        //more for flavor than anything, irl you could find goodies at any time
        const interferingEvent = News.planetHasAnyNews(p, [NT.SURPLUS, NT.DEPRESSION, NT.SCARCITY])
        return ratingsValid && geologyBonus && !interferingEvent
    }
}
