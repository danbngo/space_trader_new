class TourismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} has begun building lush attractions and resorts to attract tourists from across the system!`,
            `${coloredName(planet)} completes its attractions and resorts, attracting a rush of lucrative tourism!`,
            `${coloredName(planet)}'s push to attract tourism fails due to crime and safety concerns!`,
            ``,
            NT.TOURISM, planet
        )
        this.addPlanetEffect(
            {
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.DRUGS, CL.VERY_HIGH], [CARGO_TYPES.HOLOCUBES, CL.HIGH]]))
            },
            {
                taxes: CL.SLIGHTLY_HIGH,
                economy: CL.VERY_HIGH,
                culture: CL.HIGH,
                inflation: CL.SLIGHTLY_HIGH,
                crime: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                wealth: CL.HIGH
            },
            {
                taxes: CL.SLIGHTLY_HIGH,
                crime: CL.SLIGHTLY_HIGH,
                corruption: CL.SLIGHTLY_HIGH,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Tourism succeeds unless planet has low prestige or poor economy
        this.rollOutcome((p.c.prestige+p.c.wealth+p.c.territory)*p.c.security/3 / (p.c.crime), CL.MEDIUM)
    }

    shouldCancel() {
        const {planet: p} = this
        // Tourism cancelled if any dangerous event threatens the planet
        return News.planetHasAnyNews(p, NT_DANGEROUS)
    }

    isValid() {
        const {planet: p} = this
        //more likely to try this out if we need economy
        const ratingsValid = (p.c.economy < CL.MEDIUM) || (p.c.culture < CL.MEDIUM)
        
        // Climate must be pleasant for tourism (moderate temp, breathable atmosphere, low pollution)
        const temperatureValid = !p.climate.temperature || 
            (p.climate.temperature.value >= TEMPERATURES.MEDIUM.value && p.climate.temperature.value <= TEMPERATURES.SLIGHTLY_HIGH.value)
        const atmosphereValid = p.climate.atmosphericPressure && 
            p.climate.atmosphericPressure.value >= ATMOSPHERIC_PRESSURES.MEDIUM.value
        const pollutionValid = !p.climate.pollution || p.climate.pollution.value < POLLUTION_LEVELS.HIGH.value
        const climateValid = temperatureValid && atmosphereValid && pollutionValid
        
        const interferingEvent = 
            News.planetHasAnyNews(p, [...NT_DANGEROUS, ...NT_ECONOMY_PREVENTING]) ||
            News.planetHasAnyNewsTargeting(p, [...NT_DANGEROUS, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && climateValid && !interferingEvent
    }
}
