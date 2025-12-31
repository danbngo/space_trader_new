/**
 * Displays demographic information about a planet's population.
 * @param {Planet} planet - The planet to display demographics for.
 */
function showPlanetDemographicsMenu(planet = new Planet()) {
    const {civilization} = planet
    let msg = ''
    
    msg += `<u>Population</u><br/>`
    msg += `👥 Total Population: ${describePopulation(civilization.population)}<br/>`
    msg += `<br/>`
    
    // Racial Demographics
    msg += `<u>Racial Demographics</u><br/>`
    if (civilization.races.size > 0) {
        // Sort races by proportion (highest first)
        const sortedRaces = Array.from(civilization.races.entries())
            .sort((a, b) => b[1] - a[1])
        
        for (const [race, proportion] of sortedRaces) {
            const percentage = (proportion * 100).toFixed(1)
            const barWidth = Math.floor(proportion * 30) // Max 30 characters wide
            const bar = '█'.repeat(barWidth) + '░'.repeat(30 - barWidth)
            msg += `${race.icon} ${colorSpan(race.name, race.color)}: ${percentage}%<br/>`
            msg += `<span style="opacity: 0.6; font-family: monospace;">${bar}</span><br/>`
        }
    } else {
        msg += `<span style="opacity: 0.6;">No demographic data available</span><br/>`
    }
    
    msg += `<br/>`
    
    // Territory
    msg += `<u>Territory</u><br/>`
    msg += `🗺️ Territorial Reach: ${describeTerritory(civilization.territory)}<br/>`
    
    showPlanetModal(planet, `${coloredName(planet)} - Demographics`, msg, [
        ["Society", () => showPlanetSocietyMenu(planet)],
        ["Back", () => showPlanetMenu(planet)]
    ], 'planet_demographics', (nextPlanet) => showPlanetDemographicsMenu(nextPlanet));
}
