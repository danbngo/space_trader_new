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
    // Convert radius from Earth radii to solar radii (1 solar radius = ~109 Earth radii)
    leftContent += `Radius: ${roundToPlaces(star.radius * SOLAR_RADII_PER_AU / EARTH_RADII_PER_AU, 2)} solar radii<br/>`
    if (star.mass) {
        leftContent += `Mass: ${roundToPlaces(star.mass, 2)} solar masses<br/>`
    }
    if (star.temperature) {
        leftContent += `Temperature: ${Math.round(star.temperature).toLocaleString()} K<br/>`
    }
    leftContent += `<br/>`
    
    showModal(`${coloredName(star)} - Star Data`, leftContent, [
        ["Close", () => closeModal()]
    ]);
}
