
/**
 * Check if player is in scanning mode (viewing planet from afar).
 * @param {Planet} planet - The planet to check.
 * @returns {boolean} True if scanning, false if docked.
 */
function isScanningMode(planet) {
    return gs.location !== planet
}

/**
 * Get the settlement to display - either current (if docked) or memorized (if scanning).
 * @param {Planet} planet - The planet to get settlement for.
 * @returns {Settlement|null} The settlement to display.
 */
function getDisplaySettlement(planet) {
    if (!isScanningMode(planet)) {
        // Docked - show current settlement
        return planet.settlement
    } else {
        // Scanning - show memorized settlement if available
        return gs.memorizedSettlements.get(planet) || null
    }
}

/**
 * Get scanning mode warning message with last visit date.
 * @param {Planet} planet - The planet being scanned.
 * @returns {string} HTML warning message or empty string.
 */
function getScanningModeMessage(planet) {
    if (!isScanningMode(planet)) return ''
    
    const lastVisitYear = gs.lastVisitedDates.get(planet)
    if (lastVisitYear !== undefined) {
        const yearsSinceVisit = Math.round((gs.year - lastVisitYear) * 100) / 100
        return colorSpan(`📡 Scanning Mode - Information from last visit (${lastVisitYear.toFixed(2)}, ${yearsSinceVisit.toFixed(2)} years ago)<br/>`, COLORS.Yellow)
    } else {
        return colorSpan(`📡 Scanning Mode - No previous visit data available<br/>`, COLORS.Orange)
    }
}

/**
 * @param {Planet} planet 
 * @param {string} title 
 * @param {string|HTMLElement} msg 
 * @param {(ButtonData|HTMLElement)[]} options 
 * @param {string} modalId 
 * @param {(nextPlanet: Planet) => void} onNavigate 
 */
function showPlanetModal(planet = new Planet(), title = '', msg = '', options = [], modalId = '', onNavigate = (nextPlanet)=>{}) {
    // Create title with navigation arrows
    // Navigate within same planet type (dwarf, regular, or moons)
    let planetList;
    
    // Check if this is a moon (has a parent with children)
    if (gs.system.planets.includes(planet)) {
        // Navigate through the moons of the parent planet
        planetList = gs.system.planets;
    } 
    // Check if it's a dwarf planet
    else if (gs.system.dwarfPlanets.includes(planet)) {
        planetList = gs.system.dwarfPlanets;
    } 
    // Otherwise it's a moon
    else {
        planetList = planet.parent.children.filter(c=>(c instanceof Moon));
    }
    
    const currentIndex = planetList.indexOf(planet);
    const prevPlanet = planetList[currentIndex - 1] || planetList[planetList.length - 1] || planet;
    const nextPlanet = planetList[currentIndex + 1] || planetList[0] || planet;
    console.log('showing planet modal:',{planet, planetList, currentIndex, prevPlanet, nextPlanet});
    
    const titleEl = ce({
        style: {
            display: 'flex',
            gap: '5px',
            flexAlign: 'center',
            justifyContent: 'center',
        },
        children: [
            ce({
                tag: 'button',
                innerHTML: '◀',
                onClick: () => onNavigate(prevPlanet),
                classNames: ['planet-nav-button'],
                style: {
                    marginLeft: '0px', 
                    marginRight: '0px', 
                    marginTop: '0px',
                    background: 'none',
                    border: 'none',
                    color: 'black',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '5px 10px'
                }
            }),
            ce({
                tag: 'div',
                style: {minWidth: '300px', textAlign: 'center', color: 'black important!', marginTop: '8px'},
                children: [title]
            }),
            ce({
                tag: 'button',
                innerHTML: '▶',
                onClick: () => onNavigate(nextPlanet),
                classNames: ['planet-nav-button'],
                style: {
                    marginLeft: '0px', 
                    marginRight: '0px', 
                    marginTop: '0px',
                    background: 'none',
                    border: 'none',
                    color: 'black',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '5px 10px'
                }
            })
        ]
    });

    const modal = showModal(titleEl, msg, options, modalId, ()=>closeModal());
    
    // Add scanning mode CSS class if player is viewing from afar
    if (isScanningMode(planet)) {
        const panel = modal.querySelector('.panel')
        if (panel) panel.classList.add('scanning-mode')
    }
    
    //modal.firstChildE.style.minWidth = '90vw'
}