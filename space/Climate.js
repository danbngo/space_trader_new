// Climate class defines planetary environmental conditions
class Climate {
    /**
     * @param {Temperature} temperature - The temperature level (from TEMPERATURES)
     * @param {AtmosphericPressure} atmosphericPressure - The atmospheric pressure (from ATMOSPHERIC_PRESSURES)
     * @param {Gravity} gravity - The gravity level (from GRAVITIES)
     * @param {OceanCoverage} oceanCoverage - The ocean coverage level (from OCEAN_COVERAGES)
     * @param {GeologicalActivity} geologicalActivity - The geological activity level (from GEOLOGICAL_ACTIVITIES)
     * @param {Magnetosphere} magnetosphere - The magnetosphere strength (from MAGNETOSPHERES)
     * @param {RadiationLevel} radiationLevel - The radiation level (from RADIATION_LEVELS)
     * @param {AsteroidImpact} asteroidImpact - The asteroid impact frequency (from ASTEROID_IMPACTS)
     * @param {Pollution} pollution - The pollution level (from POLLUTION_LEVELS)
     * @param {PlanetAtmosphereType} atmosphereType - The atmospheric composition
     * @param {PlanetOceanType} oceanType - The ocean/liquid composition (can be null)
     * @param {PlanetGeologyType} geologyType - The geological composition (can be null for gas giants)
     */
    constructor(
        temperature = TEMPERATURES.NONE,
        atmosphericPressure = ATMOSPHERIC_PRESSURES.NONE,
        gravity = GRAVITIES.NONE,
        oceanCoverage = OCEAN_COVERAGES.NONE,
        geologicalActivity = GEOLOGICAL_ACTIVITIES.NONE,
        magnetosphere = MAGNETOSPHERES.NONE,
        radiationLevel = RADIATION_LEVELS.NONE,
        asteroidImpact = ASTEROID_IMPACTS.NONE,
        pollution = POLLUTION_LEVELS.NONE,
        atmosphereType = null,
        oceanType = null,
        geologyType = null
    ) {
        /** @type {Temperature} */
        this.temperature = temperature
        /** @type {AtmosphericPressure} */
        this.atmosphericPressure = atmosphericPressure
        /** @type {Gravity} */
        this.gravity = gravity
        /** @type {OceanCoverage} */
        this.oceanCoverage = oceanCoverage
        /** @type {GeologicalActivity} */
        this.geologicalActivity = geologicalActivity
        /** @type {Magnetosphere} */
        this.magnetosphere = magnetosphere
        /** @type {RadiationLevel} */
        this.radiationLevel = radiationLevel
        /** @type {AsteroidImpact} */
        this.asteroidImpact = asteroidImpact
        /** @type {Pollution} */
        this.pollution = pollution
        /** @type {PlanetAtmosphereType} */
        this.atmosphereType = atmosphereType
        /** @type {PlanetOceanType} */
        this.oceanType = oceanType
        /** @type {PlanetGeologyType} */
        this.geologyType = geologyType
    }

    /**
     * Gets a human-readable description of the climate
     * @returns {string}
     */
    getDescription() {
        const parts = []
        
        if (this.temperature !== TEMPERATURES.NONE) {
            parts.push(`Temperature: ${this.temperature.name.toLowerCase()}`)
        }
        
        if (this.atmosphericPressure !== ATMOSPHERIC_PRESSURES.NONE) {
            parts.push(`Atmosphere: ${this.atmosphericPressure.name.toLowerCase()}`)
        }
        
        if (this.gravity !== GRAVITIES.NONE) {
            parts.push(`Gravity: ${this.gravity.name.toLowerCase()}`)
        }
        
        if (this.oceanCoverage !== OCEAN_COVERAGES.NONE) {
            parts.push(`Ocean: ${this.oceanCoverage.name.toLowerCase()}`)
        }
        
        if (this.geologicalActivity !== GEOLOGICAL_ACTIVITIES.NONE) {
            parts.push(`Geology: ${this.geologicalActivity.name.toLowerCase()}`)
        }
        
        if (this.magnetosphere !== MAGNETOSPHERES.NONE) {
            parts.push(`Magnetosphere: ${this.magnetosphere.name.toLowerCase()}`)
        }
        
        if (this.radiationLevel !== RADIATION_LEVELS.NONE) {
            parts.push(`Radiation: ${this.radiationLevel.name.toLowerCase()}`)
        }
        
        if (this.asteroidImpact !== ASTEROID_IMPACTS.NONE) {
            parts.push(`Asteroid impacts: ${this.asteroidImpact.name.toLowerCase()}`)
        }
        
        if (this.pollution !== POLLUTION_LEVELS.NONE) {
            parts.push(`Pollution: ${this.pollution.name.toLowerCase()}`)
        }
        
        return parts.length > 0 ? parts.join(', ') : 'No significant climate data'
    }
}
