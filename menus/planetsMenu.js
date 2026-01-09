/**
 * Displays basic information about planets in the star system in a table format.
 * @param {Function} backFunction - Function to call when back button is pressed.
 * @param {boolean} dwarfOnly - If true, show only dwarf planets.
 * @param {boolean} stationsOnly - If true, show only space stations.
 */
function showPlanetsMenu(backFunction = () => closeModal(), dwarfOnly = false, stationsOnly = false) {
    let planets, title, emptyMessage
    
    if (stationsOnly) {
        planets = gs.system.spaceStations
        title = 'Space Stations Database'
        emptyMessage = 'No space stations detected in this star system.'
    } else if (dwarfOnly) {
        planets = gs.system.dwarfPlanets
        title = 'Dwarf Planets Database'
        emptyMessage = 'No dwarf planets detected in this star system.'
    } else {
        planets = gs.system.planets
        title = 'Planets Database'
        emptyMessage = 'No planets detected in this star system.'
    }
    
    // Filter to only planets that have been seen
    planets = planets.filter(p => gs.lastSeenDates.has(p))
    
    if (planets.length === 0) {
        showModal(title, emptyMessage, [["Back", backFunction]])
        return
    }

    // Sort planets by distance from sun
    planets.sort((a, b) => {
        const aRadius = a.orbit ? a.orbit.radius : 0
        const bRadius = b.orbit ? b.orbit.radius : 0
        return aRadius - bRadius
    })
    
    let selectedPlanet = planets[0] // Select first planet by default
    const contentContainer = ce({style: 'overflow-y: auto; max-height: 70vh;'})
    
    // Helper function to find export good for a planet (lowest buy price ratio = cheapest to buy)
    /** @param {Planet} planet */
    function findExports(planet) {
        if (!planet.s || !planet.s.market || planet.s.market.damaged) {
            return '-'
        }
        
        let bestCargoType = null
        let bestRatio = Infinity
        
        for (const [cargoType, buyPrice] of planet.s.market.calcCargoBuyPrices().counts) {
            // Skip relics - they can't be produced by planets
            if (cargoType === CARGO_TYPES.RELICS) continue
            
            if (cargoType.value > 0) {
                const ratio = buyPrice / cargoType.value
                if (ratio < bestRatio) {
                    bestRatio = ratio
                    bestCargoType = cargoType
                }
            }
        }
        
        return bestCargoType ? coloredName(bestCargoType) : '-'
    }
    
    // Helper function to find import good for a planet (highest buy price ratio = most expensive to buy)
    /** @param {Planet} planet */
    function findImports(planet) {
        if (!planet.s || !planet.s.market || planet.s.market.damaged) {
            return '-'
        }
        
        let worstCargoType = null
        let worstRatio = 0
        
        for (const [cargoType, buyPrice] of planet.s.market.calcCargoBuyPrices().counts) {
            if (cargoType.value > 0) {
                const ratio = buyPrice / cargoType.value
                if (ratio > worstRatio) {
                    worstRatio = ratio
                    worstCargoType = cargoType
                }
            }
        }
        
        return worstCargoType ? coloredName(worstCargoType) : '-'
    }
    
    // Create table data
    const tableData = planets.map(planet => {
        const c = planet.civilization
        const distanceAU = Math.round(calcDistance(planet.x, planet.y, 0, 0) * 100) / 100
        const hasVisited = gs.lastVisitedDates.has(planet)
        
        // If only seen but not visited, show limited info
        if (!hasVisited) {
            return [
                planet.descriptor,
                '?',
                `${distanceAU} AU`,
                '?',
                '?',
                '?',
                '?',
                '?'
            ]
        }
        
        return [
            coloredName(planet),
            coloredName(planet.planetType),
            `${distanceAU} AU`,
            c ? coloredName(c.governmentType) : '-',
            findExports(planet),
            findImports(planet)
        ]
    })

    tableData.unshift(['Name', 'Type', 'Distance', 'Government', 'Exports', 'Imports'])
    
    // Create table with selection (row 1 is first data row, after header row 0)
    const table = createTable(
        tableData,
        (index) => {
            if (index > 0) { // Skip header row
                selectedPlanet = planets[index]
                updateButtons()
            }
        },
        1 // Start with first data row selected
    )
    
    contentContainer.appendChild(table)
    
    function updateButtons() {
        /** @type {ButtonData[]} */
        const buttons = [["Back", backFunction, false]]
        
        if (selectedPlanet) {
            buttons.unshift(["View", () => {
                closeModal()
                if (currentMap && currentMap.selectObject) {
                    currentMap.selectObject(selectedPlanet)
                }
            }, false])
        }
        console.log('2')
        
        refreshPanelButtons('planets_menu', buttons)
    }
    
    showModal(title, contentContainer, [["Back", backFunction]], 'planets_menu')
    
    // Update buttons after modal is shown to include View button for initially selected planet
    updateButtons()
}

/**
 * Displays basic information about dwarf planets only.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showDwarfPlanetsMenu(backFunction = () => closeModal()) {
    showPlanetsMenu(backFunction, true, false)
}

/**
 * Displays basic information about space stations only.
 * @param {Function} backFunction - Function to call when back button is pressed.
 */
function showSpaceStationsMenu(backFunction = () => closeModal()) {
    showPlanetsMenu(backFunction, false, true)
}
