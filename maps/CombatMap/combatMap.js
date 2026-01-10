/**
 * @typedef {Object} ShipGroupConfig
 * @property {boolean} fadedIn - Whether the fade-in animation has completed
 * @property {number} opacity - Current opacity value (0-1)
 * @property {number} fadeStartTime - Timestamp when fade animation started
 * @property {number} xOffset - Horizontal offset for this ship group
 */

/**
 * Combat and route travel map
 * Shows tactical combat when enemies are present, or animated route travel when traveling peacefully
 */
class CombatMap extends BaseMap {
    constructor(encounter) {
        super()
        console.log('CREATING COMBAT MAP FOR ENCOUNTER:', encounter)
        
        this.encounter = encounter
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
            xOffset: 0
        }
        
        /** @type {ShipGroupConfig} */
        this.enemyShipGroupConfig = {
            fadedIn: false,
            opacity: 0,
            fadeStartTime: 0,
            xOffset: 0
        }
        
        this.shipsCreated = new Set() // Track which ships have been created by UUID
        
        // Route travel UI element references (set by route handler)
        this.routeDistanceEl = null
        this.routeETAEl = null
        
        // Initialize handlers
        this.combatHandler = new CombatMapCombatHandler(this)
        this.routeHandler = new CombatMapRouteHandler(this)
        
        // Create container
        this.root = ce({id: 'combat-map-container'})
        
        // Create canvas for rendering
        this.routeCvs = new CanvasWrapper(1, 1, 1, 0, false, false)
        this.root.appendChild(this.routeCvs.root)
        
        // Create UI panel at bottom (will be updated dynamically)
        this.updateUIPanel()
        this.root.appendChild(this.uiPanel)
        
        // Initialize tick system
        this.lastTickMs = Date.now()
        
        // Add resize listener
        this.resizeHandler = () => {
            this.routeCvs.autoResize()
        }
        window.addEventListener("resize", this.resizeHandler)
        
        showElement(this.root)
        
        // Defer canvas sizing and initial render until after DOM is rendered
        requestAnimationFrame(() => {
            this.routeCvs.autoResize()
            this.routeCvs.cameraX = 0
            this.routeCvs.cameraY = 0
            this.routeCvs.zoom = 60
            
            // Render stars once
            this.initializeStars()
            
            // Initial render of ships
            this.renderShips()
            
            // Start animation loop (handles both combat and travel)
            this.startAnimation()
        })
    }
    
    /**
     * Starts the animation loop
     * Handles both combat and travel rendering, checks for encounter changes
     */
    startAnimation() {
        const animate = () => {
            // Check if encounter changed (new enemies appeared)
            this.checkForEncounterChanges()
            
            // Update UI panel if combat state changed
            const inCombat = gs.encounter && gs.encounter.combatEnabled
            if ((inCombat && this.uiPanel?.classList?.contains('route-ui')) ||
                (!inCombat && this.uiPanel?.classList?.contains('combat-ui'))) {
                this.updateUIPanel()
            }
            
            // Render ships (always to allow fade-in and smooth animation)
            this.renderShips()
            
            // Run tick logic for travel mode
            if (!inCombat && gs.destination && gs.travelYearsRemaining !== null) {
                this.routeHandler.tick()
            }
            
            // Continue animation indefinitely
            this.routeAnimationFrame = requestAnimationFrame(animate)
        }
        animate()
    }
    
    /**
     * Checks if gs.encounter changed and updates encounter reference
     */
    checkForEncounterChanges() {
        if (gs.encounter && gs.encounter !== this.encounter) {
            console.log('🔄 Encounter changed, updating CombatMap')
            this.encounter = gs.encounter
            
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
     * Main game loop tick for travel mode - delegated to route handler
     */
    tick() {
        this.routeHandler.tick()
    }
    
    /**
     * Initializes background stars on the canvas (only called if no encounter visual exists)
     */
    initializeStars() {
        if (!this.routeCvs) return
        
        const radius = Math.max(window.innerWidth, window.innerHeight)
        const numStars = COMBAT_MAP_CONFIG.starfieldStarCount
        const backgroundStars = generateBackgroundStars(radius, numStars)
        
        backgroundStars.forEach((star) => {
            const x = Math.random() * this.routeCvs.canvas.width
            const y = Math.random() * this.routeCvs.canvas.height
            const size = Math.random() * 2 + 0.5
            this.routeCvs.addPixel(0, 0, star.color, size, x, y, true)
        })
        
        this.routeCvs.redraw(true)
        console.log('✨ Initialized stars on canvas')
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
    updateShipJitter(ship, maxX = COMBAT_MAP_CONFIG.defaultJitterX, maxY = COMBAT_MAP_CONFIG.defaultJitterY) {
        if (!this.shipJitterOffsets.has(ship)) {
            // Initialize with random target values so jitter starts immediately
            const initialTargetX = (Math.random() - 0.5) * maxX
            const initialTargetY = (Math.random() - 0.5) * maxY
            this.shipJitterOffsets.set(ship, {x: 0, y: 0, targetX: initialTargetX, targetY: initialTargetY})
        }
        const jitter = this.shipJitterOffsets.get(ship)
        
        // Update jitter target occasionally
        if (Math.random() < COMBAT_MAP_CONFIG.jitterUpdateChance) {
            jitter.targetX = (Math.random() - 0.5) * maxX
            jitter.targetY = (Math.random() - 0.5) * maxY
        }
        
        // Smooth movement toward target
        jitter.x += (jitter.targetX - jitter.x) * COMBAT_MAP_CONFIG.jitterSmoothness
        jitter.y += (jitter.targetY - jitter.y) * COMBAT_MAP_CONFIG.jitterSmoothness
        
        return jitter
    }
    
    /**
     * Renders a thruster for a ship
     * @param {Ship} ship - The ship to render thruster for
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    renderThruster(ship, x, y) {
        const isPlayer = this.isPlayerShip(ship)
        const mirror = !isPlayer // Enemy ships face left (mirrored)
        
        const flickerRange = COMBAT_MAP_CONFIG.thrusterFlickerMax - COMBAT_MAP_CONFIG.thrusterFlickerMin
        const thrusterFlicker = COMBAT_MAP_CONFIG.thrusterFlickerMin + Math.random() * flickerRange
        const thrusterSize = ship.radius * COMBAT_MAP_CONFIG.thrusterSizeMultiplier * thrusterFlicker
        const thrusterColor = [255, Math.floor(150 * thrusterFlicker), 0, Math.floor(1 * thrusterFlicker)]
        const offsetX = mirror ? ship.radius : -ship.radius
        const rotation = mirror ? 0 : Math.PI
        this.routeCvs.addFilledTriangle(
            `thruster-${ship.uuid}`,
            x + offsetX,
            y,
            thrusterSize/2,
            thrusterSize,
            2,
            thrusterColor,
            rotation,
            null
        )
    }
    
    /**
     * Renders a ship with its shape and label
     * @param {Ship} ship - The ship to render
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    renderShip(ship, x, y) {
        const isPlayer = this.isPlayerShip(ship)
        const mirror = !isPlayer // Enemy ships face left (mirrored)
        const shipSize = COMBAT_MAP_CONFIG.shipSize
        const labelOffsetY = COMBAT_MAP_CONFIG.labelOffsetY
        const shipColor = gs.fleet && gs.fleet.color ? gs.fleet.color : COLORS.White
        
        let shipObj
        if (ship.shipType.shipShape && ship.shipType.shipShape.toPolygons) {
            // Use ship shape polygons
            const polygons = ship.shipType.shipShape.toPolygons(shipColor, shipSize)
            polygons.forEach((poly) => {
                const vertices = mirror ? invertPolygons(poly.vertices) : poly.vertices
                const polyObj = this.routeCvs.addPolygon(
                    `${ship.uuid}-poly-${poly.id}`,
                    x,
                    y,
                    vertices,
                    1,
                    0,
                    shipColor,
                    null,
                    0,
                    null,
                    poly.zIndex
                )
                // Use first polygon as reference for positioning bars
                if (!shipObj) shipObj = polyObj
            })
        } else {
            // Fallback to circle if no shape generator
            shipObj = this.routeCvs.addFilledCircle(
                `${ship.uuid}`,
                x,
                y,
                shipSize,
                5,
                shipColor
            )
        }
        
        // Add ship label
        this.routeCvs.addText(
            `label-${ship.uuid}`,
            x,
            y-ship.radius,
            0,
            labelOffsetY,
            ship.shipType.name,
            COLORS.White,
            12
        )
        
        // Add progress bars using the ship object we just created
        if (shipObj) {
            this.addShipProgressBars(ship, shipObj)
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
        const x = shipObj.x
        
        // Bar background (black)
        const bgId = `${barType}-bg-${ship.uuid}`
        let bg = this.routeCvs.getObject(bgId)
        if (!bg) {
            bg = this.routeCvs.addLine(
                bgId,
                x - COMBAT_MAP_CONFIG.shipBarWidth / 2,
                barY,
                x + COMBAT_MAP_CONFIG.shipBarWidth / 2,
                barY,
                COLORS.Black,
                COMBAT_MAP_CONFIG.shipBarHeight
            )
            bg.zIndex = 100
        } else {
            bg.x = x - COMBAT_MAP_CONFIG.shipBarWidth / 2
            bg.y = barY
            bg.x2 = x + COMBAT_MAP_CONFIG.shipBarWidth / 2
            bg.y2 = barY
        }
        
        // Bar foreground (colored based on type and health)
        const fgId = `${barType}-fg-${ship.uuid}`
        let fg = this.routeCvs.getObject(fgId)
        if (!fg) {
            fg = this.routeCvs.addLine(
                fgId,
                x - COMBAT_MAP_CONFIG.shipBarWidth / 2,
                barY,
                x - COMBAT_MAP_CONFIG.shipBarWidth / 2 + COMBAT_MAP_CONFIG.shipBarWidth * fillRatio,
                barY,
                fillColor,
                COMBAT_MAP_CONFIG.shipBarHeight - 2
            )
            fg.zIndex = 101
        } else {
            fg.x = x - COMBAT_MAP_CONFIG.shipBarWidth / 2
            fg.y = barY
            fg.x2 = x - COMBAT_MAP_CONFIG.shipBarWidth / 2 + COMBAT_MAP_CONFIG.shipBarWidth * fillRatio
            fg.y2 = barY
            fg.strokeColor = fillColor
        }
    }
    
    /**
     * Adds canvas-rendered progress bars for hull and shields above a ship
     * @param {Ship} ship
     * @param {CanvasObject} shipObj - The ship's canvas object to position bars relative to
     */
    addShipProgressBars(ship, shipObj) {
        const y = shipObj.y
        
        // Calculate bar positions
        const barY = y - ship.radius + COMBAT_MAP_CONFIG.shipBarYOffset
        const hullBarY = barY
        const shieldBarY = barY - COMBAT_MAP_CONFIG.shipBarHeight - COMBAT_MAP_CONFIG.shipBarSpacing
        
        // Calculate fill ratios
        const hullPercent = ship.hull[0] / ship.hull[1]
        const shieldPercent = ship.shields[0] / ship.shields[1]
        
        // Render hull bar
        const hullColor = hullPercent < 0.3 ? COLORS.Red : COLORS.Orange
        this.addShipStatBar(ship, shipObj, 'hull', hullColor, hullPercent, hullBarY)
        
        // Render shield bar
        this.addShipStatBar(ship, shipObj, 'shield', COLORS.Blue, shieldPercent, shieldBarY)

        console.log('✅ Added/updated progress bars for ship:', ship.shipType.name, shipObj.x, y, shieldPercent, hullPercent)
    }
    
    /**
     * Renders a group of ships with fade-in animation
     * @param {Ship[]} ships - Array of ships to render

     * @param {string} groupType - 'player' or 'enemy' prefix for IDs
     * @param {ShipGroupConfig} config - Configuration object for this ship group
     */
    renderShipGroup(ships, groupType, config) {
        const shipSpacing = COMBAT_MAP_CONFIG.shipSpacing
        
        // Handle fade-in animation
        if (!config.fadedIn) {
            if (config.opacity === 0) {
                config.fadeStartTime = Date.now()
            }
            const elapsed = Date.now() - config.fadeStartTime
            const fadeTime = COMBAT_MAP_CONFIG.enemyFadeInDuration
            config.opacity = Math.min(1, elapsed / fadeTime)
            
            if (config.opacity >= 1) {
                config.fadedIn = true
            }
        }
        
        // Render each ship
        ships.forEach((ship, index) => {
            if (ship.disabled) return
            
            const isPlayer = this.isPlayerShip(ship)
            const jitter = this.updateShipJitter(ship)
            const shipY = 0 + (index - (ships.length - 1) / 2) * shipSpacing + jitter.y
            const shipX = config.xOffset + jitter.x
            
            // Check if ship already exists on canvas
            const shipExists = this.shipsCreated.has(ship.uuid)
            
            // Create or update thruster
            const thrusterId = `thruster-${ship.uuid}`
            const thrusterObj = this.routeCvs.getObject(thrusterId)
            if (thrusterObj) {
                const thrusterOffset = isPlayer ? -ship.radius : ship.radius
                thrusterObj.x = shipX + thrusterOffset
                thrusterObj.y = shipY
            } else {
                this.renderThruster(ship, shipX, shipY)
            }
            
            // Create or update ship
            if (!shipExists) {
                this.renderShip(ship, shipX, shipY)
                this.shipsCreated.add(ship.uuid)
            } else {
                this.updateShipPosition(ship, shipX, shipY)
            }
            
            // Apply fade-in opacity
            if (!config.fadedIn) {
                this.routeCvs.drawOrder.forEach(obj => {
                    if (obj.id && obj.id.includes(ship.uuid)) {
                        if (obj.fillColor && obj.fillColor.length >= 4) {
                            obj.fillColor[3] = Math.floor(1 * config.opacity)
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
        if (!this.routeCvs || !this.encounter || !this.encounter.playerShips) {
            console.error('❌ renderShips: routeCvs or encounter is null!')
            return
        }
        
        // Update offsets based on current canvas size
        this.playerShipGroupConfig.xOffset = -(this.routeCvs.canvas.width / this.routeCvs.zoom) * Math.abs(COMBAT_MAP_CONFIG.playerShipsOffset)
        this.enemyShipGroupConfig.xOffset = (this.routeCvs.canvas.width / this.routeCvs.zoom) * COMBAT_MAP_CONFIG.enemyShipsOffset
        
        // Render player ships
        this.renderShipGroup(this.encounter.playerShips, 'player', this.playerShipGroupConfig)
        
        // Render enemy ships if they exist
        if (this.encounter.enemyShips && this.encounter.enemyShips.length > 0) {
            this.renderShipGroup(this.encounter.enemyShips, 'enemy', this.enemyShipGroupConfig)
        }
        
        this.routeCvs.redraw(true)
    }

    /**
     * Updates the position of existing ship objects on canvas
     * @param {Ship} ship
     * @param {number} x
     * @param {number} y
     */
    updateShipPosition(ship, x, y) {
        // Update polygons or circle
        if (ship.shipType.shipShape && ship.shipType.shipShape.toPolygons) {
            const shipColor = gs.fleet && gs.fleet.color ? gs.fleet.color : COLORS.White
            const shipSize = COMBAT_MAP_CONFIG.shipSize
            const polygons = ship.shipType.shipShape.toPolygons(shipColor, shipSize)
            polygons.forEach((poly) => {
                const obj = this.routeCvs.getObject(`${ship.uuid}-poly-${poly.id}`)
                if (obj) {
                    obj.x = x
                    obj.y = y
                }
            })
        } else {
            const obj = this.routeCvs.getObject(`${ship.uuid}`)
            if (obj) {
                obj.x = x
                obj.y = y
            }
        }
        
        // Update label
        const label = this.routeCvs.getObject(`label-${ship.uuid}`)
        if (label) {
            label.x = x
            label.y = y
        }
        
        // Get the ship's main canvas object and update progress bars
        let shipObj
        if (ship.shipType.shipShape && ship.shipType.shipShape.toPolygons) {
            shipObj = this.routeCvs.getObject(`${ship.uuid}-poly-0`)
        } else {
            shipObj = this.routeCvs.getObject(`${ship.uuid}`)
        }
        
        // Update progress bars
        if (shipObj) {
            this.addShipProgressBars(ship, shipObj)
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
    refreshCombatMap() {
        if (!this.encounter) return
        
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
function showCombatMap() {
    const map = new CombatMap()
    showMap(map)
}
