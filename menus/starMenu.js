/**
 * Displays detailed information about a star including type, features, and characteristics.
 * @param {Star} star - The star to display information for.
 */
function showStarMenu(star = new Star()) {
    // Build left column: Physical Properties
    let leftContent = `<u>Physical Properties</u><br/>`
    leftContent += `Class: ${coloredName(star.objectType)}<br/>`
    if (star.starType) {
        leftContent += `Type: ${colorSpan(star.starType.name, star.starType.color)}<br/>`
        leftContent += `Spectral Class: ${colorSpan(star.starType.spectralClass, star.starType.color)}<br/>`
    }
    leftContent += `Radius: ${roundToPlaces(star.radius * SOLAR_RADII_PER_AU, 2)} solar radii<br/>`
    if (star.mass) {
        leftContent += `Mass: ${roundToPlaces(star.mass, 2)} solar masses<br/>`
    }
    if (star.temperature) {
        leftContent += `Temperature: ${Math.round(star.temperature).toLocaleString()} K<br/>`
    }
    if (star.magnetosphereRadius) {
        leftContent += `Heliosphere: ${roundToPlaces(star.magnetosphereRadius, 1)} AU<br/>`
    }
    leftContent += `<br/>`
    
    // Build right column: Stellar Characteristics
    let rightContent = `<u>Stellar Characteristics</u><br/>`
    if (star.metallicity) {
        rightContent += `Metallicity: ${star.metallicity.coloredName}<br/>`
    }
    if (star.age) {
        rightContent += `Age: ${star.age.coloredName}<br/>`
    }
    if (star.luminosity) {
        rightContent += `Luminosity: ${star.luminosity.coloredName}<br/>`
    }
    
    // Add some blank lines if needed to balance columns
    rightContent += `<br/>`
    rightContent += `<br/>`
    rightContent += `<br/>`
    
    // Create column layout
    const columnLayout = createColumnLayout([leftContent, rightContent])
    
    // Star features (outside the columns)
    const features = ce({children: []})
    if (star.features && star.features.length > 0) {
        features.appendChild(ce({tag: 'br'}))
        features.appendChild(ce({children: ['<u>Notable Features</u><br/>']}))
        for (const feature of star.features) {
            features.appendChild(ce({
                children: [`${colorSpan('●', feature.color)} ${colorSpan(feature.name, feature.color)}: ${feature.description}<br/>`]
            }))
        }
    }
    
    const content = ce({
        children: [columnLayout, features]
    })
    
    showModal(`${coloredName(star)} - Star Data`, content, [
        ["Close", () => closeModal()]
    ]);
}
