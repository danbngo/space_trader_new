/**
 * Handles route travel-specific functionality for CombatMap
 */
class CombatMapRouteHandler {
    /**
     * @param {CombatMap} combatMap - Reference to parent CombatMap instance
     */
    constructor(combatMap) {
        this.combatMap = combatMap
    }

    /**
     * Main game loop tick for travel mode
     */
    tick() {
        // Check if travel is still active
        if (!gs.destination || gs.travelYearsRemaining === null) {
            console.log('Travel ended')
            this.combatMap.cleanup()
            return
        }
        
        // Pause travel progress if there's an active encounter
        if (gs.encounter) {
            // Continue rendering ships but don't update time/progress
            this.combatMap.renderShips()
            setTimeout(() => requestAnimationFrame(() => this.tick()), COMBAT_MAP_CONFIG.tickRate)
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
        this.combatMap.renderShips()
        
        // Check if travel completed
        if (gs.travelYearsRemaining <= 0) {
            this.handleTravelComplete()
            return
        }
        
        // Continue tick loop with 60fps target
        setTimeout(() => requestAnimationFrame(() => this.tick()), COMBAT_MAP_CONFIG.tickRate)
    }

    /**
     * Updates the progress bar UI element
     * @param {number} progressPercent
     */
    updateProgressBar(progressPercent) {
        if (this.combatMap.routeProgressBar) {
            this.combatMap.routeProgressBar.update(progressPercent)
        }
    }

    /**
     * Updates the distance display UI element
     */
    updateDistanceDisplay() {
        if (this.combatMap.routeDistanceEl && gs.destination && gs.fleet) {
            const currentDistance = calcDistance(gs.fleet.x, gs.fleet.y, gs.destination.x, gs.destination.y)
            this.combatMap.routeDistanceEl.innerHTML = `Distance: ${roundToPlaces(currentDistance, 1)} AU`
        }
    }

    /**
     * Updates the ETA display UI element
     */
    updateETADisplay() {
        if (this.combatMap.routeETAEl) {
            this.combatMap.routeETAEl.innerHTML = `ETA: ${describeTimespan(Math.max(0, gs.travelYearsRemaining), 1)}`
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
    handleTravelComplete() {
        console.log('Travel completed - docking at', gs.destination.name)
        
        // Dock at destination
        gs.fleet.dock(gs.destination)
        
        // Clear travel state
        gs.previousLocation = null
        gs.destination = null
        gs.travelYearsRemaining = null
        gs.travelProgress = null
        gs.travelStartYear = null
        gs.x = null
        gs.y = null
        
        // Return to star map
        this.combatMap.cleanup()
        showStarMap(gs.location)
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
        this.combatMap.routeDistanceEl = ce({
            innerHTML: `Distance: ${distance} AU`
        })
        statsContainer.appendChild(this.combatMap.routeDistanceEl)
        
        // ETA Remaining
        this.combatMap.routeETAEl = ce({
            innerHTML: `ETA: ${describeTimespan(gs.travelYearsRemaining || 0, 1)}`
        })
        statsContainer.appendChild(this.combatMap.routeETAEl)
        
        panel.appendChild(statsContainer)
        
        // Create progress bar using ProgressBar class
        this.combatMap.routeProgressBar = new ProgressBar({
            value: 0,
            width: 60,
            fillColor: '#4CAF50',
            borderColor: '#666',
            overrideLabel: ''
        })
        panel.appendChild(this.combatMap.routeProgressBar.container)
        
        // Cancel button
        const cancelButton = ce({
            tag: 'button',
            innerHTML: 'Cancel Travel',
            classNames: ['route-cancel-button']
        })
        
        cancelButton.addEventListener('click', () => {
            // Stop animation and cleanup
            this.combatMap.cleanup()
            
            // Return to star map without completing travel
            showStarMap()
        })
        
        panel.appendChild(cancelButton)
        
        return panel
    }
}
