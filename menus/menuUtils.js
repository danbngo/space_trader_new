
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
        const yearsSinceVisit = gs.year - lastVisitYear
        return colorSpan(`📡 Scanning Mode - Information from last visit (${describeDate(lastVisitYear)}, ${describeTimespan(yearsSinceVisit)} ago)<br/>`, COLORS.Yellow)
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
    
    // Filter to only include visited planets
    planetList = planetList.filter(p => gs.lastVisitedDates.has(p));
    
    const currentIndex = planetList.indexOf(planet);
    const prevPlanet = planetList[currentIndex - 1] || planetList[planetList.length - 1] || planet;
    const nextPlanet = planetList[currentIndex + 1] || planetList[0] || planet;
    
    // Check if there are other planets to navigate to
    const hasOtherTargets = planetList.length > 1;
    const noTargetsMessage = "No other discovered objects of this type yet";
    
    console.log('showing planet modal:',{planet, planetList, currentIndex, prevPlanet, nextPlanet, hasOtherTargets});
    
    const leftButton = ce({
        tag: 'button',
        innerHTML: '◀',
        onClick: hasOtherTargets ? () => onNavigate(prevPlanet) : null,
        classNames: ['planet-nav-button'],
        style: {
            marginLeft: '0px', 
            marginRight: '0px', 
            marginTop: '0px',
            background: 'none',
            border: 'none',
            color: hasOtherTargets ? 'black' : '#ccc',
            cursor: hasOtherTargets ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            padding: '5px 10px'
        }
    });
    
    const rightButton = ce({
        tag: 'button',
        innerHTML: '▶',
        onClick: hasOtherTargets ? () => onNavigate(nextPlanet) : null,
        classNames: ['planet-nav-button'],
        style: {
            marginLeft: '0px', 
            marginRight: '0px', 
            marginTop: '0px',
            background: 'none',
            border: 'none',
            color: hasOtherTargets ? 'black' : '#ccc',
            cursor: hasOtherTargets ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            padding: '5px 10px'
        }
    });
    
    // Add popover tooltips if navigation is disabled
    if (!hasOtherTargets) {
        createPopoverElement(leftButton, noTargetsMessage);
        createPopoverElement(rightButton, noTargetsMessage);
    }
    
    const titleEl = ce({
        style: {
            display: 'flex',
            gap: '5px',
            flexAlign: 'center',
            justifyContent: 'center',
        },
        children: [
            leftButton,
            ce({
                tag: 'div',
                style: {minWidth: '300px', textAlign: 'center', color: 'black important!', marginTop: '8px'},
                children: [title]
            }),
            rightButton
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