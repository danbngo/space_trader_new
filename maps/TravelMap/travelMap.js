/**
 * @typedef {Object} ShipGroupConfig
 * @property {boolean} fadedIn - Whether the fade-in animation has completed
 * @property {number} opacity - Current opacity value (0-1)
 * @property {number} fadeStartTime - Timestamp when fade animation started
 * @property {number} xOffset - Horizontal offset for this ship group
 * @property {boolean} mirror - Whether ships in this group should be mirrored horizontally
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
        this.selectedEnemyShip = null
        this.routeAnimationFrame = null
        this.routeProgress = 0
        this.shipJitterOffsets = new Map()
        this.routeProgressBar = null
        
        /** @type {ShipGroupConfig} */
        this.playerShipGroupConfig = {
            fadedIn: false,
            opacity: 0,
            fadeStartTime: 0,
            xOffset: 0,
            mirror: false
        }
        
        /** @type {ShipGroupConfig} */
        this.enemyShipGroupConfig = {
            fadedIn: false,
            opacity: 0,
            fadeStartTime: 0,
            xOffset: 0,
            mirror: true
        }
        
        this.shipsCreated = new Set() // Track which ships have been created by UUID
        
        // Route travel UI element references (set by route handler)
        this.routeDistanceEl = null
        this.routeETAEl = null
        
        // Initialize handlers
        this.combatHandler = new TravelMapCombatHandler(this)
        this.routeHandler = new TravelMapRouteHandler(this)
        
        // Create container
        this.root = ce({id: 'travel-map-container'})
        
        // Create background canvas for static stars (rendered once)
        this.bgCvs = new CanvasWrapper(`travelmap-background-map-canvas`, 1, 1, 1, 100, false, false)
        this.bgCvs.canvas.style.pointerEvents = 'none' // Don't capture mouse events
        
        // Create main canvas for dynamic content (ships, labels, etc)
        this.routeCvs = new CanvasWrapper(`travelmap-main-map-canvas`, 1, 1, 1, 100, false, false)
        
        // Add both canvases to root (bg first, then main on top)
        this.root.appendChild(this.bgCvs.root)
        this.root.appendChild(this.routeCvs.root)
        
        // Create UI panel at bottom (will be updated dynamically)
        this.updateUIPanel()
        this.root.appendChild(this.uiPanel)
        
        // Initialize tick system
        this.lastTickMs = Date.now()
        
        // Add resize listener
        this.resizeHandler = () => {
            console.log('resizing travel map canvases')
            this.routeCvs.autoResize()
            this.bgCvs.autoResize()
            // Re-render background stars when canvas size changes
            this.renderBackgroundStars()
        }
        window.addEventListener("resize", this.resizeHandler)
        
        showElement(this.root)
        
        // Defer canvas sizing and initial render until after DOM is rendered
        requestAnimationFrame(() => {
            this.routeCvs.autoResize()
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
            
            // Update UI panel if combat state changed
            const inCombat = gs.encounter && gs.encounter.combatEnabled
            if ((inCombat && this.uiPanel?.classList?.contains('route-ui')) ||
                (!inCombat && this.uiPanel?.classList?.contains('travel-ui'))) {
                this.updateUIPanel()
            }
            
            // Render ships (always to allow fade-in and smooth animation)
            this.renderShips()
            
            // Run tick logic for travel mode
            if (!inCombat && gs.destination && gs.travelYearsRemaining !== null) {
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
        console.log('🔄 Encounter changed, updating TravelMap')
        
        // Reset fade states for new encounter
        this.enemyShipGroupConfig.fadedIn = false
        this.enemyShipGroupConfig.opacity = 0
        this.enemyShipGroupConfig.fadeStartTime = 0
        
        // Update selected ships if in combat
        if (gs.combat) {
            this.selectedPlayerShip = gs.combat.activePlayerShips?.[0] || null
            this.selectedEnemyShip = gs.combat.activeEnemyShips?.[0] || null
        }
    }
    
    /**
     * Updates the UI panel based on current combat state
     */
    updateUIPanel() {
        const inCombat = gs.encounter && gs.encounter.combatEnabled
        const newPanel = inCombat 
            ? this.combatHandler.createCombatUIPanel()
            : this.routeHandler.createRouteTravelUIPanel()
        
        if (this.uiPanel) {
            this.uiPanel.replaceWith(newPanel)
        }
        this.uiPanel = newPanel
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
                [255, 255, 255, 1],
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
     * Checks if a ship belongs to the player
     * @param {Ship} ship
     * @returns {boolean}
     */
    isPlayerShip(ship) {
        return gs.fleet && gs.fleet.ships && gs.fleet.ships.some(s => s.uuid === ship.uuid)
    }
    
    /**
     * Updates jitter offset for a ship (smooth random movement)
     * @param {Ship} ship - The ship to update jitter for
     * @param {number} maxX - Maximum horizontal jitter (±)
     * @param {number} maxY - Maximum vertical jitter (±)
     */
    updateShipJitter(ship, maxX = TRAVEL_MAP_CONFIG.defaultJitterX, maxY = TRAVEL_MAP_CONFIG.defaultJitterY) {
        if (!this.shipJitterOffsets.has(ship)) {
            // Initialize with random target values so jitter starts immediately
            const initialTargetX = (Math.random() - 0.5) * maxX
            const initialTargetY = (Math.random() - 0.5) * maxY
            this.shipJitterOffsets.set(ship, {x: 0, y: 0, targetX: initialTargetX, targetY: initialTargetY})
        }
        const jitter = this.shipJitterOffsets.get(ship)
        
        // Update jitter target occasionally
        if (Math.random() < TRAVEL_MAP_CONFIG.jitterUpdateChance) {
            jitter.targetX = (Math.random() - 0.5) * maxX
            jitter.targetY = (Math.random() - 0.5) * maxY
        }
        
        // Smooth movement toward target
        jitter.x += (jitter.targetX - jitter.x) * TRAVEL_MAP_CONFIG.jitterSmoothness
        jitter.y += (jitter.targetY - jitter.y) * TRAVEL_MAP_CONFIG.jitterSmoothness
        
        return jitter
    }
    
    /**
     * Renders a thruster for a ship (initial creation only)
     * @param {Ship} ship - The ship to render thruster for
     * @param {ShipGroupConfig} shipGroupConfig - Configuration for this ship's group
     */
    renderThruster(ship, shipGroupConfig) {
        console.log('Creating initial thruster for ship:', ship.shipType.name, shipGroupConfig)
        const rotation = shipGroupConfig.mirror ? 0 : Math.PI
        this.routeCvs.addFilledTriangle(
            `thruster-${ship.uuid}`,
            0, 0,
            100,
            100,
            2,
            COLORS.Red,
            rotation,
            null
        )
    }
    
    /**
     * Renders a ship with its shape and label
     * @param {Ship} ship - The ship to render
     * @param {ShipGroupConfig} shipGroupConfig - Configuration for this ship's group
     */
    renderShip(ship, shipGroupConfig) {
        console.log('Rendering ship:', ship.shipType.name, 'Config:', shipGroupConfig)
        const shipSize = TRAVEL_MAP_CONFIG.shipSize
        const labelOffsetY = TRAVEL_MAP_CONFIG.labelOffsetY
        const baseShipColor = gs.fleet && gs.fleet.color ? gs.fleet.color : COLORS.White
        // Apply fade opacity to ship color at creation time
        const shipColor = [...baseShipColor]
        if (shipColor.length >= 4) {
            shipColor[3] = shipGroupConfig.opacity
        }
        
        let shipObj
        if (ship.shipType.shipShape && ship.shipType.shipShape.addCanvasObject) {
            shipObj = ship.shipType.shipShape.addCanvasObject(this.routeCvs, ship, shipColor, shipSize)
        } else {
            throw new Error('ship must have a shipshape')
        }
        
        // Add ship label
        const labelColor = [...COLORS.White]
        //if (labelColor.length >= 4) {
            //labelColor[3] = shipGroupConfig.opacity
        //}
        this.routeCvs.addText(
            `label-${ship.uuid}`,
            shipObj.x,
            shipObj.y-ship.radius,
            0,
            labelOffsetY,
            ship.shipType.name,
            labelColor,
            12
        )
        
        // Add progress bars using the ship object we just created
        if (shipObj) {
            this.addShipProgressBars(ship, shipObj, shipGroupConfig)
            this.renderThruster(ship, shipGroupConfig)
        }
    }
    
    /**
     * Renders a single stat bar (hull or shields) for a ship
     * @param {Ship} ship - The ship this bar belongs to
     * @param {CanvasObject} shipObj - The ship's canvas object for positioning
     * @param {string} barType - Type identifier ('hull' or 'shield')
     * @param {Array} fillColor - RGBA color array for the foreground bar
     * @param {number} fillRatio - Fill percentage (0-1)
     * @param {number} barY - Y position for this bar
     */
    addShipStatBar(ship, shipObj, barType, fillColor, fillRatio, barY) {
        //console.log(`Adding ${barType} bar for ship:`, ship.shipType.name, 'Fill ratio:', fillRatio)
        const x = shipObj.x
        
        // Bar background (black) - note: fillColor already has opacity applied from caller
        const bgId = `${barType}-bg-${ship.uuid}`
        let bg = this.routeCvs.getObject(bgId)
        if (!bg) {
            const bgColor = [...COLORS.Black]
            // Apply same opacity as fillColor to background
            if (bgColor.length >= 4 && fillColor.length >= 4) {
                bgColor[3] = fillColor[3]
            }
            bg = this.routeCvs.addLine(
                bgId,
                x - TRAVEL_MAP_CONFIG.shipBarWidth / 2,
                barY,
                x + TRAVEL_MAP_CONFIG.shipBarWidth / 2,
                barY,
                bgColor,
                TRAVEL_MAP_CONFIG.shipBarHeight
            )
            bg.zIndex = 100
        } else {
            bg.x = x - TRAVEL_MAP_CONFIG.shipBarWidth / 2
            bg.y = barY
            bg.x2 = x + TRAVEL_MAP_CONFIG.shipBarWidth / 2
            bg.y2 = barY
        }
        
        // Bar foreground (colored based on type and health)
        const fgId = `${barType}-fg-${ship.uuid}`
        let fg = this.routeCvs.getObject(fgId)
        if (!fg) {
            fg = this.routeCvs.addLine(
                fgId,
                x - TRAVEL_MAP_CONFIG.shipBarWidth / 2,
                barY,
                x - TRAVEL_MAP_CONFIG.shipBarWidth / 2 + TRAVEL_MAP_CONFIG.shipBarWidth * fillRatio,
                barY,
                fillColor,
                TRAVEL_MAP_CONFIG.shipBarHeight - 2
            )
            fg.zIndex = 101
        } else {
            fg.x = x - TRAVEL_MAP_CONFIG.shipBarWidth / 2
            fg.y = barY
            fg.x2 = x - TRAVEL_MAP_CONFIG.shipBarWidth / 2 + TRAVEL_MAP_CONFIG.shipBarWidth * fillRatio
            fg.y2 = barY
            fg.strokeColor = fillColor
        }
    }
    
    /**
     * Adds canvas-rendered progress bars for hull and shields above a ship
     * @param {Ship} ship
     * @param {CanvasObject} shipObj - The ship's canvas object to position bars relative to
     * @param {ShipGroupConfig} shipGroupConfig - Configuration for opacity and other settings
     */
    addShipProgressBars(ship, shipObj, shipGroupConfig) {
        const y = shipObj.y
        
        // Calculate bar positions
        const barY = y - TRAVEL_MAP_CONFIG.shipSize/2 + TRAVEL_MAP_CONFIG.shipBarYOffset
        const hullBarY = barY
        const shieldBarY = barY - TRAVEL_MAP_CONFIG.shipBarHeight - TRAVEL_MAP_CONFIG.shipBarSpacing
        
        // Calculate fill ratios
        const hullPercent = ship.hull[0] / ship.hull[1]
        const shieldPercent = ship.shields[0] / ship.shields[1]
        
        // Render hull bar with opacity applied
        const baseHullColor = hullPercent < 0.3 ? COLORS.Red : COLORS.Orange
        const hullColor = [...baseHullColor]
        if (hullColor.length >= 4) {
            hullColor[3] = shipGroupConfig.opacity
        }
        this.addShipStatBar(ship, shipObj, 'hull', hullColor, hullPercent, hullBarY)
        
        // Render shield bar with opacity applied
        const shieldColor = [...COLORS.Blue]
        if (shieldColor.length >= 4) {
            shieldColor[3] = shipGroupConfig.opacity
        }
        this.addShipStatBar(ship, shipObj, 'shield', shieldColor, shieldPercent, shieldBarY)

        //console.log('✅ Added/updated progress bars for ship:', ship.shipType.name, shipObj.x, y, shieldPercent, hullPercent)
    }
    
    /**
     * Renders a group of ships with fade-in animation
     * @param {Ship[]} ships - Array of ships to render
     * @param {ShipGroupConfig} config - Configuration object for this ship group
     */
    renderShipGroup(ships, config) {
        const shipSpacing = TRAVEL_MAP_CONFIG.shipSpacing
        
        // Handle fade-in animation
        if (!config.fadedIn) {
            if (config.fadeStartTime === 0) {
                config.fadeStartTime = Date.now()
            }
            const elapsed = Date.now() - config.fadeStartTime
            const fadeTime = TRAVEL_MAP_CONFIG.enemyFadeInDuration
            config.opacity = Math.min(1, elapsed / fadeTime)
            //console.log('Fading in ships, opacity:', config.opacity)
            
            if (config.opacity >= 1) {
                config.fadedIn = true
            }
        }
        
        // Render each ship
        ships.forEach((ship, index) => {
            if (ship.disabled) return
            
            const jitter = this.updateShipJitter(ship)
            const shipY = 0 + (index - (ships.length - 1) / 2) * shipSpacing + jitter.y
            const shipX = config.xOffset + jitter.x
            
            // Check if ship already exists on canvas
            const shipExists = this.shipsCreated.has(ship.uuid)
            
            // Create or update ship
            if (!shipExists) {
                this.renderShip(ship, config)
                this.shipsCreated.add(ship.uuid)
            } else {
                this.updateShipPosition(ship, shipX, shipY, config)
            }
            
            // Apply fade-in opacity
            if (!config.fadedIn) {
                this.routeCvs.drawOrder.forEach(obj => {
                    if (obj.id && obj.id.includes(ship.uuid)) {
                        if (obj.fillColor && obj.fillColor.length >= 4) {
                            obj.fillColor[3] = config.opacity
                        }
                        if (obj.strokeColor && obj.strokeColor.length >= 4) {
                            obj.strokeColor[3] = config.opacity
                        }
                    }
                })
            }
        })
    }
    
    /**
     * Renders ships with thrusters and jitter
     * Creates ship objects once, then updates their positions on subsequent calls
     */
    renderShips() {
        // Update offsets based on current canvas size
        this.playerShipGroupConfig.xOffset = -(this.routeCvs.canvas.width / this.routeCvs.zoom) * Math.abs(TRAVEL_MAP_CONFIG.playerShipsOffset)
        this.enemyShipGroupConfig.xOffset = (this.routeCvs.canvas.width / this.routeCvs.zoom) * TRAVEL_MAP_CONFIG.enemyShipsOffset
        
        // Render player ships
        this.renderShipGroup(gs.fleet.ships, this.playerShipGroupConfig)
        
        // Render enemy ships if they exist
        if (gs.encounter && gs.encounter.enemyShips && gs.encounter.enemyShips.length > 0) {
            this.renderShipGroup(gs.encounter.enemyShips, this.enemyShipGroupConfig)
        }
        
        this.routeCvs.redraw(true)
    }

    /**
     * Updates the position of existing ship objects on canvas
     * @param {Ship} ship
     * @param {number} x
     * @param {number} y
     * @param {ShipGroupConfig} shipGroupConfig - Configuration for opacity and other settings
     */
    updateShipPosition(ship, x, y, shipGroupConfig) {
        // Update ship object position
        const shipObj = this.routeCvs.getObject(`ship-bitmap-${ship.uuid}`) || this.routeCvs.getObject(`${ship.uuid}`)
        if (shipObj) {
            shipObj.x = x
            shipObj.y = y
        }
        
        // Update thruster position, size, and color with flicker effect
        const thrusterObj = this.routeCvs.getObject(`thruster-${ship.uuid}`)
        if (thrusterObj) {
            // Calculate flicker
            const flickerRange = TRAVEL_MAP_CONFIG.thrusterFlickerMax - TRAVEL_MAP_CONFIG.thrusterFlickerMin
            const thrusterFlicker = TRAVEL_MAP_CONFIG.thrusterFlickerMin + Math.random() * flickerRange
            
            // Update size with flicker
            const thrusterSize = TRAVEL_MAP_CONFIG.shipSize/2 * TRAVEL_MAP_CONFIG.thrusterSizeMultiplier * thrusterFlicker
            thrusterObj.size = thrusterSize / 2
            thrusterObj.minorSize = thrusterSize
            
            // Update color with flicker
            const thrusterColor = [255, Math.floor(150 * thrusterFlicker), 0, shipGroupConfig.opacity * thrusterFlicker]
            thrusterObj.fillColor = thrusterColor
            
            // Update position
            const thrusterOffset = shipGroupConfig.mirror ? TRAVEL_MAP_CONFIG.shipSize/2 : -TRAVEL_MAP_CONFIG.shipSize/2
            thrusterObj.x = x + thrusterOffset
            thrusterObj.y = y
        }
        
        // Update label
        const label = this.routeCvs.getObject(`label-${ship.uuid}`)
        if (label) {
            label.x = x
            label.y = y - TRAVEL_MAP_CONFIG.shipSize/2
        }
        
        // Update progress bars
        if (shipObj) {
            this.addShipProgressBars(ship, shipObj, shipGroupConfig)
        }
    }

    /**
     * Updates the ship info display - delegated to combat handler
     * @param {HTMLElement} infoElement
     */
    updateShipInfo(infoElement) {
        this.combatHandler.updateShipInfo(infoElement)
    }

    /**
     * Creates action buttons based on available move types
     * @returns {HTMLElement}
     */
    /**
     * Refreshes the combat log display from encounter's log
     */
    refreshCombatLog() {
        this.combatHandler.refreshCombatLog()
    }

    /**
     * Refreshes the combat map display
     */
    refreshTravelMap() {
        // Re-render the ships on canvas
        if (this.routeCvs) {
            this.renderShips()
        }
        
        // Update UI panel
        if (this.uiPanel) {
            const newPanel = this.combatHandler.createCombatUIPanel()
            this.uiPanel.replaceWith(newPanel)
            this.uiPanel = newPanel
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

/**
 * Factory function to create and show a combat map
 */
function showTravelMap() {
    const map = new TravelMap()
    showMap(map)
}
