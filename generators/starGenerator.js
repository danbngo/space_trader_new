/**
 * @fileoverview Generator function for creating stars with detailed properties.
 * @module generators/starGenerator
 */

/**
 * Generates a star with detailed properties including type, features, and characteristics.
 * @param {string} name - The name of the star.
 * @param {StarType} [starType] - Optional star type. If not provided, randomly selects from main sequence.
 * @param {number} [x=0] - X position.
 * @param {number} [y=0] - Y position.
 * @param {Orbit} [orbit=null] - Orbit for binary systems.
 * @returns {Star} The generated star.
 */
function generateStar(name = "Unnamed", starType = null, x = 0, y = 0, orbit = null) {
    // If no star type provided, select from main sequence (weighted toward common types)
    if (!starType) {
        const weights = MAIN_SEQUENCE_STAR_TYPES.map(st => st.weight)
        const index = rndIndexWeighted(weights)
        starType = MAIN_SEQUENCE_STAR_TYPES[index]
    }
    
    // Generate radius within type's range (in solar radii, then convert to AU)
    const radiusInSolarRadii = starType.minRadius + Math.random() * (starType.maxRadius - starType.minRadius)
    const radiusInAU = radiusInSolarRadii / SOLAR_RADII_PER_AU
    
    // Generate mass within type's range (not used for gameplay but stored for lore)
    const massInSolarMasses = starType.minMass + Math.random() * (starType.maxMass - starType.minMass)
    
    // Generate temperature within type's range
    const temperatureKelvin = starType.minTemp + Math.random() * (starType.maxTemp - starType.minTemp)
    
    // Create the star
    const star = new Star(name, starType.color, radiusInAU, orbit)
    
    // Add generated properties
    star.starType = starType
    star.mass = massInSolarMasses
    star.temperature = temperatureKelvin
    star.x = x
    star.y = y
    
    return star
}

/**
 * Generates an exotic star (giant, dwarf, neutron star, black hole, etc.)
 * @param {string} name - The name of the star.
 * @param {StarType} starType - The exotic star type.
 * @param {number} [x=0] - X position.
 * @param {number} [y=0] - Y position.
 * @param {Orbit} [orbit=null] - Orbit for binary systems.
 * @returns {Star} The generated exotic star.
 */
function generateExoticStar(name, starType, x = 0, y = 0, orbit = null) {
    const radiusInSolarRadii = starType.minRadius + Math.random() * (starType.maxRadius - starType.minRadius)
    const radiusInAU = radiusInSolarRadii / SOLAR_RADII_PER_AU
    const massInSolarMasses = starType.minMass + Math.random() * (starType.maxMass - starType.minMass)
    const temperatureKelvin = starType.minTemp + Math.random() * (starType.maxTemp - starType.minTemp)
    
    const star = new Star(name, starType.color, radiusInAU, orbit)
    
    star.starType = starType
    star.mass = massInSolarMasses
    star.temperature = temperatureKelvin
    star.x = x
    star.y = y
    
    return star
}
