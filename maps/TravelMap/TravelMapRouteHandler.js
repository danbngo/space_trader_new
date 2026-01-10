/**
 * Handles route travel-specific functionality for TravelMap
 */
class TravelMapRouteHandler {
    /**
     * @param {TravelMap} travelMap - Reference to parent TravelMap instance
     */
    constructor(travelMap) {
        this.travelMap = travelMap
    }

    /**
     * Main game loop tick for travel mode
     */
    tick() {
        // Check if travel is still active
        if (!gs.destination || gs.travelYearsRemaining === null || gs.travelYearsRemaining <= 0) {
            this.handleTravelComplete()
            console.log('Travel ended')
            return
        }
        
        // Update positions of planets/stars (this also calls system.travel() internally)
        gs.system.updatePositions()
        
        // Get progress percentage for UI display
        const progressPercent = gs.travelProgress || 0
        
        // Update UI elements
        this.updateProgressBar(progressPercent)
        this.updateDistanceDisplay()
        this.updateETADisplay()
        
        // Roll for encounter
        this.checkForEncounter()
        
        // Render ships
        this.travelMap.renderShips()
        
        // Continue tick loop with 60fps target - not needed, handled in parent class
        //setTimeout(() => requestAnimationFrame(() => this.tick()), TRAVEL_MAP_CONFIG.tickRate)
    }

    /**
     * Updates the progress bar UI element
     * @param {number} progressPercent
     */
    updateProgressBar(progressPercent) {
        if (this.travelMap.routeProgressBar) {
            this.travelMap.routeProgressBar.update(progressPercent)
        }
    }

    /**
     * Updates the distance display UI element
     */
    updateDistanceDisplay() {
        if (this.travelMap.routeDistanceEl && gs.destination && gs.fleet) {
            const currentDistance = calcDistance(gs.fleet.x, gs.fleet.y, gs.destination.x, gs.destination.y)
            this.travelMap.routeDistanceEl.innerHTML = `Distance: ${roundToPlaces(currentDistance, 1)} AU`
        }
    }

    /**
     * Updates the ETA display UI element
     */
    updateETADisplay() {
        if (this.travelMap.routeETAEl) {
            this.travelMap.routeETAEl.innerHTML = `ETA: ${describeTimespan(Math.max(0, gs.travelYearsRemaining), 1)}`
        }
    }

    /**
     * Checks if an encounter should occur and triggers it if so
     */
    checkForEncounter() {
        //console.log('rolling for encounter:', YEARS_PER_TRAVEL_TICK, 'years elapsed, base encounter chance per day:', BASE_ENCOUNTER_CHANCE_PER_DAY)
        
        const encounterOccurrences = calcOccurrencesPerTimespan(BASE_ENCOUNTER_CHANCE_PER_DAY, YEARS_PER_TRAVEL_TICK*365)
        if (encounterOccurrences >= 1) {
            console.log('Encounter triggered!')
            
            // Determine encounter type and planet using standalone functions
            const encounterType = rollEncounterType(gs.previousLocation, gs.destination)
            const encounterPlanet = rollEncounterPlanet(encounterType, gs.previousLocation, gs.destination, gs.fleet)
            console.log('Encounter type:', encounterType.name, 'at planet:', encounterPlanet?.name)
            
            // Create and start the encounter
            const EncounterClass = encounterType.encounterClass
            const encounter = new EncounterClass(encounterType, encounterPlanet, gs.fleet, null)
            encounter.startEncounter()
        }
    }

    /**
     * Handles completion of travel
     */
    handleTravelComplete(dockAt = gs.destination) {
        console.log('Travel completed - docking at', dockAt)
        
        // Dock at destination
        gs.fleet.dock(dockAt)
        
        // Clear travel state
        gs.previousLocation = null
        gs.destination = null
        gs.travelYearsRemaining = null
        gs.travelProgress = null
        gs.travelStartYear = null
        gs.x = null
        gs.y = null
        
        showStarMap(dockAt)
    }

    /**
     * Creates the route travel UI panel with progress bar and cancel button
     * @returns {HTMLElement}
     */
    createRouteTravelUIPanel() {
        const panel = ce({
            id: 'route-ui-panel'
        })
        
        // Calculate travel details
        const fromName = gs.previousLocation ? gs.previousLocation.name : 'Unknown'
        const toName = gs.destination ? gs.destination.name : 'Unknown'
        const distance = gs.destination && gs.previousLocation ? 
            roundToPlaces(calcDistance(gs.previousLocation.x, gs.previousLocation.y, gs.destination.x, gs.destination.y), 1) : 0
        
        // Planet images container
        const planetImagesContainer = ce({classNames: ['route-planet-images']})
        
        // From planet image
        if (gs.previousLocation && gs.previousLocation.asCanvas) {
            planetImagesContainer.appendChild(gs.previousLocation.asCanvas())
        }
        
        // Arrow
        planetImagesContainer.appendChild(ce({
            innerHTML: '→',
            classNames: ['route-arrow']
        }))
        
        // To planet image
        if (gs.destination && gs.destination.asCanvas) {
            planetImagesContainer.appendChild(gs.destination.asCanvas())
        }
        
        panel.appendChild(planetImagesContainer)
        
        // Progress info with route
        panel.appendChild(ce({
            classNames: ['route-info'],
            innerHTML: `Traveling from ${fromName} to ${toName}`
        }))
        
        // Travel stats container
        const statsContainer = ce({classNames: ['route-stats']})
        
        // Distance
        this.travelMap.routeDistanceEl = ce({
            innerHTML: `Distance: ${distance} AU`
        })
        statsContainer.appendChild(this.travelMap.routeDistanceEl)
        
        // ETA Remaining
        this.travelMap.routeETAEl = ce({
            innerHTML: `ETA: ${describeTimespan(gs.travelYearsRemaining || 0, 1)}`
        })
        statsContainer.appendChild(this.travelMap.routeETAEl)
        
        panel.appendChild(statsContainer)
        
        // Create progress bar using ProgressBar class
        this.travelMap.routeProgressBar = new ProgressBar({
            value: 0,
            width: 60,
            fillColor: '#4CAF50',
            borderColor: '#666',
            overrideLabel: ''
        })
        panel.appendChild(this.travelMap.routeProgressBar.container)
        
        // Cancel button
        const cancelButton = ce({
            tag: 'button',
            innerHTML: 'Cancel Travel',
            classNames: ['route-cancel-button']
        })
        
        cancelButton.addEventListener('click', () => {
            this.handleTravelComplete(gs.previousLocation)
        })
        
        panel.appendChild(cancelButton)
        
        return panel
    }
}
