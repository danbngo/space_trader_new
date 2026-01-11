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
class TravelMap extends BaseMap {
    constructor() {
        super()
        console.log('CREATING TRAVEL MAP')
        
        this.selectedPlayerShip = null
        this.routeAnimationFrame = null
        this.routeProgress = 0
        this.routeProgressBar = null
        this.targetingMode = null // 'laser', 'ram', or null
        this.animations = [] // Active animations (Loop instances)
        this.logPanel = null // Combat log panel at top
        
        // Route travel UI element references (set by route handler)
        this.routeDistanceEl = null
        this.routeETAEl = null
        
        // Track UI state to detect changes
        this.previousUIState = null
        
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
        if (this.logPanel) this.root.appendChild(this.logPanel)
        this.root.appendChild(this.uiPanel)
        
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
        
        showElement(this.root)
        
        // Defer canvas sizing and initial render until after DOM is rendered
        requestAnimationFrame(() => {
            this.cvs.autoResize()
            this.bgCvs.autoResize()
            
            // Render stars once to background canvas
            this.renderBackgroundStars()
            
            // Start animation loop (handles both combat and travel)
            this.startAnimation()
        })
    }
    
    /**
     * Starts the animation loop
     * Handles both combat and travel rendering, checks for encounter changes
     */
    startAnimation() {
        console.log('STARTING TRAVEL MAP ANIMATION')
        this.isAnimating = true
        const animate = () => {
            // Check if animation should continue
            if (!this.isAnimating) {
                console.log('Animation loop stopped')
                return
            }
            
            // Update active animations and remove completed ones
            const currentMs = Date.now()
            this.animations.forEach(anim => anim.update(currentMs))
            this.animations = this.animations.filter(anim => !anim.completed)
            
            // Update UI panel if state changed
            const currentUIState = gs.encounter ? (gs.encounter.combatEnabled ? 'combat' : 'encounter') : 'travel'
            if (currentUIState !== this.previousUIState) {
                console.log('UI state changed from', this.previousUIState, 'to', currentUIState)
                this.previousUIState = currentUIState
                this.updateUIPanel()
            }
            
            // Render ships (always to allow fade-in and smooth animation)
            this.shipHandler.renderShips()
            
            // Run tick logic for travel mode
            if (currentUIState === 'travel' && gs.destination && gs.travelYearsRemaining !== null) {
                // && gs.travelYearsRemaining > 0 <-- dont include this check, we want to detect whether route is complete in the subclass
                this.routeHandler.tick()
            }
            
            // Continue animation
            this.routeAnimationFrame = requestAnimationFrame(animate)
        }
        animate()
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
        let newLogPanel = null
        
        if (inCombat) {
            // Create both log panel (top) and button panel (bottom)
            newLogPanel = this.combatHandler.createCombatLogPanel()
            newPanel = this.combatHandler.createCombatUIPanel()
            
            // Replace or add the log panel
            if (this.logPanel) {
                this.logPanel.replaceWith(newLogPanel)
            } else {
                this.root.insertBefore(newLogPanel, this.uiPanel || this.root.firstChild)
            }
            this.logPanel = newLogPanel
            
            // Replace the button panel
            if (this.uiPanel) {
                this.uiPanel.replaceWith(newPanel)
            }
            this.uiPanel = newPanel
            
            // Populate the combat log after creating the panels
            this.combatHandler.refreshCombatLog()
        } else {
            // Remove log panel when not in combat
            if (this.logPanel) {
                this.logPanel.remove()
                this.logPanel = null
            }
            
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
     * Sets up targeting mode - brightens enemy ships for targeting, keeps selected ship bright
     */
    setupTargetingMode() {
        if (!gs.encounter || !gs.encounter.fleet || !gs.encounter.fleet.ships) return
        
        // Handle player ships during targeting
        gs.fleet.ships.forEach(ship => {
            const shipObj = this.cvs.getObject(`ship-${ship.uuid}`)
            if (shipObj) {
                // Disable all player ship interactions during targeting
                shipObj.onClick = null
                shipObj.onHover = null
                shipObj.onHoverEnd = null
            }
        })
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
        
        // Wait for images to load, then redraw
        this.waitForImagesLoaded([this.bgCvs])
    }

    /**
     * Refreshes the combat map display
     */
    refreshTravelMap() {
        // Re-render the ships on canvas
        if (this.cvs) {
            this.shipHandler.renderShips()
        }
        
        // Update UI panel
        if (this.uiPanel) {
            const newPanel = this.combatHandler.createCombatUIPanel()
            this.uiPanel.replaceWith(newPanel)
            this.uiPanel = newPanel
            // Always refresh combat log after recreating the panel
            this.combatHandler.refreshCombatLog()
        }
    }

    /**
     * Cleans up resources (animations, event listeners)
     */
    cleanup() {
        console.log('CLEANUP CALLED ON TRAVEL MAP')
        // Stop animation loop
        this.isAnimating = false
        if (this.routeAnimationFrame) {
            cancelAnimationFrame(this.routeAnimationFrame)
            this.routeAnimationFrame = null
        }
        // Remove resize listener
        if (this.resizeHandler) {
            window.removeEventListener("resize", this.resizeHandler)
        }
    }
}

function showTravelMap() {
    const map = new TravelMap()
    showMap(map)
}
