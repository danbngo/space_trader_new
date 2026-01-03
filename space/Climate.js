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
     * Gets the property name associated with a climate type array
     * @param {Object} climateTypeArray - The climate type constants object (e.g., TEMPERATURES, POLLUTION_LEVELS)
     * @returns {string|null} The property name or null if not found
     * @private
     */
    _getPropertyName(climateTypeArray) {
        if (climateTypeArray === TEMPERATURES) return 'temperature'
        if (climateTypeArray === ATMOSPHERIC_PRESSURES) return 'atmosphericPressure'
        if (climateTypeArray === GRAVITIES) return 'gravity'
        if (climateTypeArray === OCEAN_COVERAGES) return 'oceanCoverage'
        if (climateTypeArray === GEOLOGICAL_ACTIVITIES) return 'geologicalActivity'
        if (climateTypeArray === MAGNETOSPHERES) return 'magnetosphere'
        if (climateTypeArray === RADIATION_LEVELS) return 'radiationLevel'
        if (climateTypeArray === ASTEROID_IMPACTS) return 'asteroidImpact'
        if (climateTypeArray === POLLUTION_LEVELS) return 'pollution'
        if (climateTypeArray === PLANET_ATMOSPHERE_TYPES) return 'atmosphereType'
        if (climateTypeArray === PLANET_OCEAN_TYPES) return 'oceanType'
        if (climateTypeArray === PLANET_GEOLOGY_TYPES) return 'geologyType'
        return null
    }

    /**
     * Gets the current climate value for a given climate type
     * @param {Object} climateTypeArray - The climate type constants object (e.g., TEMPERATURES, POLLUTION_LEVELS)
     * @returns {ClimateValue|null} The current climate value or null if not found
     */
    getClimateValue(climateTypeArray) {
        const propertyName = this._getPropertyName(climateTypeArray)
        return propertyName ? this[propertyName] : null
    }

    /**
     * Sets the climate value for a given climate type
     * @param {Object} climateTypeArray - The climate type constants object (e.g., TEMPERATURES, POLLUTION_LEVELS)
     * @param {ClimateValue} newValue - The new climate value to set
     * @returns {boolean} True if successful, false otherwise
     */
    setClimateValue(climateTypeArray, newValue) {
        const propertyName = this._getPropertyName(climateTypeArray)
        if (propertyName) {
            this[propertyName] = newValue
            return true
        }
        return false
    }

    /**
     * Increments or decrements the climate value by stepping through the array
     * @param {Object} climateTypeArray - The climate type constants object (e.g., TEMPERATURES, POLLUTION_LEVELS, PLANET_ATMOSPHERE_TYPES)
     * @param {number} amount - The number of steps to increment (positive) or decrement (negative)
     * @returns {boolean} True if successful, false otherwise
     */
    incrementClimateValue(climateTypeArray, amount) {
        const propertyName = this._getPropertyName(climateTypeArray)
        if (!propertyName) return false

        const currentValue = this[propertyName]
        
        // Get the full array of values for this climate type
        const allValues = Object.values(climateTypeArray)
        
        // Handle null values (allow incrementing from null for type properties)
        let currentIndex
        if (currentValue === null) {
            currentIndex = amount > 0 ? -1 : allValues.length
        } else {
            currentIndex = allValues.findIndex(v => v === currentValue)
            if (currentIndex === -1) return false
        }

        // Calculate new index with clamping
        const newIndex = Math.max(0, Math.min(allValues.length - 1, currentIndex + amount))
        this[propertyName] = allValues[newIndex]
        
        return true
    }

    /**
     * Sets a type property (atmosphereType, oceanType, or geologyType) by incrementing through available types
     * @param {Object} typeArray - The type constants object (PLANET_ATMOSPHERE_TYPES, PLANET_OCEAN_TYPES, or PLANET_GEOLOGY_TYPES)
     * @param {number} amount - The number of steps to increment (positive) or decrement (negative)
     * @returns {boolean} True if successful, false otherwise
     */
    incrementTypeValue(typeArray, amount) {
        return this.incrementClimateValue(typeArray, amount)
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
