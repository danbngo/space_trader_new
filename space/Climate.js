// Climate class defines planetary environmental conditions
class Climate {
    /**
     * @param {number} temperature - The temperature level (from TEMPERATURE enum)
     * @param {number} atmosphericPressure - The atmospheric pressure (from ATMOSPHERIC_PRESSURE enum)
     * @param {number} gravity - The gravity level (from GRAVITY enum)
     * @param {number} oceanCoverage - The ocean coverage level (from OCEAN_COVERAGE enum)
     * @param {number} geologicalActivity - The geological activity level (from GEOLOGICAL_ACTIVITY enum)
     */
    constructor(
        temperature = TEMPERATURE.NONE,
        atmosphericPressure = ATMOSPHERIC_PRESSURE.NONE,
        gravity = GRAVITY.NONE,
        oceanCoverage = OCEAN_COVERAGE.NONE,
        geologicalActivity = GEOLOGICAL_ACTIVITY.NONE
    ) {
        /** @type {number} */
        this.temperature = temperature
        /** @type {number} */
        this.atmosphericPressure = atmosphericPressure
        /** @type {number} */
        this.gravity = gravity
        /** @type {number} */
        this.oceanCoverage = oceanCoverage
        /** @type {number} */
        this.geologicalActivity = geologicalActivity
    }

    /**
     * Gets a human-readable description of the climate
     * @returns {string}
     */
    getDescription() {
        const parts = []
        
        if (this.temperature !== TEMPERATURE.NONE) {
            const tempKey = Object.keys(TEMPERATURE).find(key => TEMPERATURE[key] === this.temperature)
            parts.push(`Temperature: ${tempKey.replace(/_/g, ' ').toLowerCase()}`)
        }
        
        if (this.atmosphericPressure !== ATMOSPHERIC_PRESSURE.NONE) {
            const pressureKey = Object.keys(ATMOSPHERIC_PRESSURE).find(key => ATMOSPHERIC_PRESSURE[key] === this.atmosphericPressure)
            parts.push(`Atmosphere: ${pressureKey.replace(/_/g, ' ').toLowerCase()}`)
        }
        
        if (this.gravity !== GRAVITY.NONE) {
            const gravityKey = Object.keys(GRAVITY).find(key => GRAVITY[key] === this.gravity)
            parts.push(`Gravity: ${gravityKey.replace(/_/g, ' ').toLowerCase()}`)
        }
        
        if (this.oceanCoverage !== OCEAN_COVERAGE.NONE) {
            const oceanKey = Object.keys(OCEAN_COVERAGE).find(key => OCEAN_COVERAGE[key] === this.oceanCoverage)
            parts.push(`Ocean: ${oceanKey.replace(/_/g, ' ').toLowerCase()}`)
        }
        
        if (this.geologicalActivity !== GEOLOGICAL_ACTIVITY.NONE) {
            const geoKey = Object.keys(GEOLOGICAL_ACTIVITY).find(key => GEOLOGICAL_ACTIVITY[key] === this.geologicalActivity)
            parts.push(`Geology: ${geoKey.replace(/_/g, ' ').toLowerCase()}`)
        }
        
        return parts.length > 0 ? parts.join(', ') : 'No significant climate data'
    }
}
