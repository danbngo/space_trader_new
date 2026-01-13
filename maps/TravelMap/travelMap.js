/**
 * @typedef {Object} ShipGroupConfig
 * @property {boolean} fadedIn - Whether the fade-in animation has completed
 * @property {number} opacity - Current opacity value (0-1)
 * @property {number} fadeStartTime - Timestamp when fade animation started
 * @property {number} xOffset - Horizontal offset for this ship group
 * @property {boolean} mirror - Whether ships in this group should be mirrored horizontally
 * @property {boolean} fadingOut - Whether this group is currently fading out
 * @property {Function|null} onFadeOutComplete - Callback to execute when fade-out completes
 * @property {Ship[]|null} fadeOutShips - Ships to render during fade-out (stored when encounter ends)
 */

/**
 * Combat and route travel map
 * Shows tactical combat when enemies are present, or animated route travel when traveling peacefully
 */
class TravelMap {
    constructor() {
        console.log('CREATING TRAVEL MAP')
        
        this.selectedShip = null
        this.routeProgress = 0
        this.routeProgressBar = null
        this.animations = [] // Active animations
        
        // Track UI state to detect changes
        this.previousUIState = null
        this.currentUIState = 'travel'
        this.isPaused = true
        
        // Initialize handlers
        this.combatHandler = new TravelMapCombatHandler(this)
        this.routeHandler = new TravelMapRouteHandler(this)
        this.shipHandler = new TravelMapShipHandler(this)
        
        // Create container
        this.root = ce({id: 'travel-map-container'})
        
        // Create background canvas for static stars (rendered once)
        this.bgCvs = new CanvasWrapper(`travelmap-background-map-canvas`, 1, 1, 1, 100, false, false)
        this.bgCvs.canvas.style.pointerEvents = 'none' // Don't capture mouse events
        
        // Create main canvas for dynamic content (ships, labels, etc)
        this.cvs = new CanvasWrapper(`travelmap-main-map-canvas`, 1, 1, 1, 100, false, false)
        
        // Add both canvases to root (bg first, then main on top)
        this.root.appendChild(this.bgCvs.root)
        this.root.appendChild(this.cvs.root)
        
        // Create UI panels (will be updated dynamically)
        this.updateUIPanel()
        this.root.appendChild(this.uiPanel)
        this.statsContainer = null;
        
        // Initialize tick system
        this.lastTickMs = Date.now()
        
        // Add resize listener
        this.resizeHandler = () => {
            console.log('resizing travel map canvases')
            this.cvs.autoResize()
            this.bgCvs.autoResize()
            // Re-render background stars when canvas size changes
            this.renderBackgroundStars()
        }
        window.addEventListener("resize", this.resizeHandler)
        
        // Defer canvas sizing and initial render until after DOM is rendered
        requestAnimationFrame(() => {
            this.cvs.autoResize()
            this.bgCvs.autoResize()
            // Render stars once to background canvas
            this.renderBackgroundStars()
            
            // Start animation loop (handles both combat and travel)
            this.tick()
        })
    }
    
    /**
     * Starts the animation loop
     * Handles both combat and travel rendering, checks for encounter changes
     */
    tick() {
        //console.log('STARTING TRAVEL MAP TICK')
        // Check if animation should continue
        if (!this.isPaused) {
            console.log('Travel map tick stopped')
            return
        }
        if (!gs.encounter && gs.fleet.stranded) {
            console.log("Travel map - doing nothing since player stranded. Tow ship logic should kick in.")
            this.isPaused = true
            handlePlayerStranded()
            this.cleanupRemovedShips()
            this.cvs.redraw()
            return
        }
        this.refresh()
        // Run tick logic for travel mode
        if (this.currentUIState === 'travel' && gs.destination && gs.travelYearsRemaining !== null) {
            // && gs.travelYearsRemaining > 0 <-- dont include this check, we want to detect whether route is complete in the subclass
            this.routeHandler.tick()
        }
        this.handleAnimations() //must go after other updates to ensure ship positions are correct
        this.cvs.redraw(true)
        requestAnimationFrame(() => this.tick())
    }

    handleAnimations() {
        // Update active animations and remove completed ones
        const currentMs = Date.now()
        const prevAnimCount = this.animations.length
        //console.log('handling animations:', this.animations.length, 'active','time:',currentMs)
        this.animations.forEach(anim => anim.update(currentMs))
        this.animations = this.animations.filter(anim => !anim.completed)
        
        // If animations just finished, refresh UI panel to show action buttons again
        if (prevAnimCount > 0 && this.animations.length === 0) {
            this.updateUIPanel()
        }
        // Render ships (always to allow fade-in and smooth animation)
    }

    refreshUIState() {
        // Update UI panel if state changed
        const currentUIState = gs.encounter ? (gs.encounter.combatEnabled ? 'combat' : 'encounter') : 'travel'
        if (currentUIState !== this.previousUIState) {
            console.log('UI state changed from', this.previousUIState, 'to', currentUIState)
            this.previousUIState = currentUIState
            this.updateUIPanel()
        }
    }
    
    /**
     * Checks if gs.encounter changed and updates encounter reference
     */
    resetNPCShipsConfig() {
        this.shipHandler.resetNPCShipsConfig()
    }
    
    /**
     * Triggers fade-out animation for enemy ships
     * @param {Function} onComplete - Callback to execute when fade-out completes
     */
    fadeOutEnemyShips(onComplete) {
        this.shipHandler.fadeOutEnemyShips(onComplete)
    }
    
    /**
     * Removes canvas objects for ships that no longer exist
     */
    cleanupRemovedShips() {
        this.shipHandler.cleanupRemovedShips()
    }
    
    /**
     * Updates the UI panel based on current combat state
     */
    updateUIPanel() {
        const inCombat = gs.encounter && gs.encounter.combatEnabled
        let newPanel
        
        if (inCombat) {
            // Create both log panel (top) and button panel (bottom)
            newPanel = this.combatHandler.createCombatUIPanel()

            // Replace the button panel
            if (this.uiPanel) {
                this.uiPanel.replaceWith(newPanel)
            }
            this.uiPanel = newPanel
        } else {
            if (gs.encounter) {
                // Hide UI panel during encounters (when modal is shown)
                newPanel = ce({innerHTML: 'test', style: {color: 'red', fontSize: '40px'}})
            } else {
                newPanel = this.routeHandler.createRouteTravelUIPanel()
            }
            
            if (this.uiPanel) {
                this.uiPanel.replaceWith(newPanel)
            }
            this.uiPanel = newPanel
        }
    }
    
    /**
     * Render background stars to background canvas (called once on init and on resize)
     */
    renderBackgroundStars() {
        const {width, height} = this.bgCvs.canvas
        
        // Add bitmap background if not already present
        const bgId = 'starmap-background'
        if (!this.bgCvs.getObject(bgId)) {
            const canvasSize = Math.max(width, height) / this.bgCvs.pixelRatio
            const bmp = this.bgCvs.addBitmap(
                bgId,
                0, 0,
                BACKGROUNDS.STARFIELD_1.src,
                canvasSize, // Size to cover canvas
                0,
                null,
                0,
                null,
                -1000, // Behind everything
                true, // parallax = true (immune to zoom)
                true  // overlap = true (covers at least the available space)
            )
            console.log('Created starmap background bitmap', bmp)
        }
    }

    /**
     * Refreshes the combat map display
     */
    refresh() {
        // Re-render the ships on canvas
        if (this.cvs) this.shipHandler.renderShips()
        this.refreshUIState()
    }

    /**
     * Cleans up resources (animations, event listeners)
     */
    cleanup() {
        console.log('CLEANUP CALLED ON TRAVEL MAP')
        // Stop animation loop
        this.isPaused = false
        // Remove resize listener
        if (this.resizeHandler) {
            window.removeEventListener("resize", this.resizeHandler)
        }
    }
}

function showTravelMap() {
    const map = new TravelMap()
    showMapWithFade(map)
}
