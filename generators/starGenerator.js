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
    
    // Generate metallicity
    const metallicityWeights = STAR_METALLICITY_LEVELS_ALL.map(m => m.weight)
    const metallicityIndex = rndIndexWeighted(metallicityWeights)
    const metallicity = STAR_METALLICITY_LEVELS_ALL[metallicityIndex]
    
    // Generate age based on star type
    let age = null
    if (starType === STAR_TYPES.O_TYPE || starType === STAR_TYPES.B_TYPE) {
        // Massive stars are always young (burn out quickly)
        age = Math.random() < 0.5 ? STAR_AGE_LEVELS.INFANT : STAR_AGE_LEVELS.YOUNG
    } else if (starType === STAR_TYPES.M_TYPE || starType === STAR_TYPES.RED_DWARF) {
        // Red dwarfs can be very old
        const ageIndex = rndIndexWeighted([0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        age = STAR_AGE_LEVELS_ALL[ageIndex]
    } else {
        // Other stars have more typical age distribution
        const ageIndex = rndIndexWeighted([0.5, 1, 2, 3, 5, 7, 6, 4, 2, 1])
        age = STAR_AGE_LEVELS_ALL[ageIndex]
    }
    
    // Generate luminosity based on star type
    let luminosity = null
    if (starType === STAR_TYPES.O_TYPE || starType === STAR_TYPES.B_TYPE) {
        luminosity = rndMember([
            STAR_LUMINOSITY_LEVELS.INTENSELY_LUMINOUS,
            STAR_LUMINOSITY_LEVELS.HYPERLUMINOUS,
            STAR_LUMINOSITY_LEVELS.ULTRALUMINOUS
        ])
    } else if (starType === STAR_TYPES.A_TYPE) {
        luminosity = rndMember([
            STAR_LUMINOSITY_LEVELS.BRILLIANT,
            STAR_LUMINOSITY_LEVELS.INTENSELY_LUMINOUS
        ])
    } else if (starType === STAR_TYPES.F_TYPE) {
        luminosity = rndMember([
            STAR_LUMINOSITY_LEVELS.BRIGHT,
            STAR_LUMINOSITY_LEVELS.VERY_BRIGHT,
            STAR_LUMINOSITY_LEVELS.BRILLIANT
        ])
    } else if (starType === STAR_TYPES.G_TYPE) {
        luminosity = rndMember([
            STAR_LUMINOSITY_LEVELS.MODERATE,
            STAR_LUMINOSITY_LEVELS.SOLAR,
            STAR_LUMINOSITY_LEVELS.BRIGHT
        ])
    } else if (starType === STAR_TYPES.K_TYPE) {
        luminosity = rndMember([
            STAR_LUMINOSITY_LEVELS.LOW,
            STAR_LUMINOSITY_LEVELS.MODERATE,
            STAR_LUMINOSITY_LEVELS.SOLAR
        ])
    } else if (starType === STAR_TYPES.M_TYPE || starType === STAR_TYPES.RED_DWARF) {
        luminosity = rndMember([
            STAR_LUMINOSITY_LEVELS.DIM,
            STAR_LUMINOSITY_LEVELS.FAINT,
            STAR_LUMINOSITY_LEVELS.SUBDUED
        ])
    } else {
        // Default for other types
        luminosity = STAR_LUMINOSITY_LEVELS.SOLAR
    }
    
    // Generate features (10% chance per feature, some star types get specific features)
    const features = []
    
    // Binary system chance (15% for main sequence)
    if (Math.random() < 0.15) {
        features.push(STAR_FEATURE_TYPES.BINARY_COMPANION)
    }
    
    // Variable star features (more common in certain types)
    if ((starType === STAR_TYPES.M_TYPE || starType === STAR_TYPES.RED_DWARF) && Math.random() < 0.2) {
        features.push(STAR_FEATURE_TYPES.FLARE_STAR)
    }
    
    // Magnetic features
    if (Math.random() < 0.1) {
        features.push(rndMember([
            STAR_FEATURE_TYPES.INTENSE_MAGNETIC_FIELD,
            STAR_FEATURE_TYPES.STELLAR_SPOTS,
            STAR_FEATURE_TYPES.CORONAL_MASS_EJECTIONS
        ]))
    }
    
    // Rotation features
    if (Math.random() < 0.08) {
        features.push(rndMember([
            STAR_FEATURE_TYPES.RAPID_ROTATION,
            STAR_FEATURE_TYPES.DIFFERENTIAL_ROTATION
        ]))
    }
    
    // Composition anomalies based on metallicity
    if (metallicity === STAR_METALLICITY_LEVELS.EXTREMELY_RICH || metallicity === STAR_METALLICITY_LEVELS.VERY_RICH) {
        if (Math.random() < 0.3) features.push(STAR_FEATURE_TYPES.METAL_RICH)
    }
    if (metallicity === STAR_METALLICITY_LEVELS.ULTRA_POOR || metallicity === STAR_METALLICITY_LEVELS.EXTREMELY_POOR) {
        if (Math.random() < 0.3) features.push(STAR_FEATURE_TYPES.METAL_POOR)
    }
    
    // System features (debris, asteroid belts, etc.)
    if (Math.random() < 0.15) {
        features.push(rndMember([
            STAR_FEATURE_TYPES.DEBRIS_DISK,
            STAR_FEATURE_TYPES.ASTEROID_BELT,
            STAR_FEATURE_TYPES.KUIPER_BELT
        ]))
    }
    
    // Circumstellar disk (more common in young stars)
    if (age === STAR_AGE_LEVELS.PROTO_STAR || age === STAR_AGE_LEVELS.INFANT) {
        if (Math.random() < 0.5) {
            features.push(STAR_FEATURE_TYPES.CIRCUMSTELLAR_DISK)
        }
    }
    
    // Heliosphere/magnetosphere radius (typically 100-150 AU for Sol-like stars)
    const magnetosphereRadius = 100 + Math.random() * 50
    
    // Create the star
    const star = new Star(name, starType.color, radiusInAU, orbit, magnetosphereRadius)
    
    // Add generated properties
    star.starType = starType
    star.features = features
    star.metallicity = metallicity
    star.age = age
    star.luminosity = luminosity
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
    
    // Exotic stars get special features
    const features = []
    
    if (starType === STAR_TYPES.WHITE_DWARF || starType === STAR_TYPES.BLACK_DWARF) {
        features.push(STAR_FEATURE_TYPES.ZOMBIE_STAR)
        if (Math.random() < 0.2) features.push(STAR_FEATURE_TYPES.PLANETARY_NEBULA)
    }
    
    if (starType === STAR_TYPES.RED_GIANT || starType === STAR_TYPES.RED_SUPERGIANT) {
        if (Math.random() < 0.3) features.push(STAR_FEATURE_TYPES.WOLF_RAYET)
    }
    
    if (starType === STAR_TYPES.PULSAR) {
        features.push(STAR_FEATURE_TYPES.PULSAR_BEAM)
    }
    
    if (starType === STAR_TYPES.MAGNETAR) {
        features.push(STAR_FEATURE_TYPES.INTENSE_MAGNETIC_FIELD)
    }
    
    if (starType === STAR_TYPES.STELLAR_BLACK_HOLE || starType === STAR_TYPES.SUPERMASSIVE_BLACK_HOLE) {
        features.push(STAR_FEATURE_TYPES.GRAVITATIONAL_LENSING)
        if (Math.random() < 0.3) features.push(STAR_FEATURE_TYPES.ACCRETION_DISK)
        if (Math.random() < 0.2) features.push(STAR_FEATURE_TYPES.ERGOSPHERE)
    }
    
    const magnetosphereRadius = 100 + Math.random() * 50
    const star = new Star(name, starType.color, radiusInAU, orbit, magnetosphereRadius)
    
    star.starType = starType
    star.features = features
    star.metallicity = STAR_METALLICITY_LEVELS.SOLAR
    star.age = STAR_AGE_LEVELS.ANCIENT
    star.luminosity = STAR_LUMINOSITY_LEVELS.SOLAR
    star.mass = massInSolarMasses
    star.temperature = temperatureKelvin
    star.x = x
    star.y = y
    
    return star
}
