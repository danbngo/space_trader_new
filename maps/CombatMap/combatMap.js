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
        this.playerShipsFadedIn = false
        this.playerShipsOpacity = 0
        this.playerShipsFadeStartTime = 0
        this.enemyShipsFadedIn = false
        this.enemyShipsOpacity = 0
        this.enemyShipsFadeStartTime = 0
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
            this.enemyShipsFadedIn = false
            this.enemyShipsOpacity = 0
            this.enemyShipsFadeStartTime = 0
            
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
        const idPrefix = isPlayer ? 'player' : 'enemy'
        
        const flickerRange = COMBAT_MAP_CONFIG.thrusterFlickerMax - COMBAT_MAP_CONFIG.thrusterFlickerMin
        const thrusterFlicker = COMBAT_MAP_CONFIG.thrusterFlickerMin + Math.random() * flickerRange
        const thrusterSize = ship.radius * COMBAT_MAP_CONFIG.thrusterSizeMultiplier * thrusterFlicker
        const thrusterColor = [255, Math.floor(150 * thrusterFlicker), 0, Math.floor(1 * thrusterFlicker)]
        const offsetX = mirror ? ship.radius : -ship.radius
        const rotation = mirror ? 0 : Math.PI
        this.routeCvs.addFilledTriangle(
            `thruster-${idPrefix}-${ship.uuid}`,
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
        const idPrefix = isPlayer ? 'player' : 'enemy'
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
                    `${idPrefix}-${ship.uuid}-poly-${poly.id}`,
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
                `${idPrefix}-${ship.uuid}`,
                x,
                y,
                shipSize,
                5,
                shipColor
            )
        }
        
        // Add ship label
        this.routeCvs.addText(
            `${idPrefix}-label-${ship.uuid}`,
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
     * Adds canvas-rendered progress bars for hull and shields above a ship
     * @param {Ship} ship
     * @param {CanvasObject} shipObj - The ship's canvas object to position bars relative to
     */
    addShipProgressBars(ship, shipObj) {
        const isPlayer = this.isPlayerShip(ship)
        const idPrefix = isPlayer ? 'player' : 'enemy'
        
        const barWidth = 50
        const barHeight = 8
        const barSpacing = 4
        const yOffset = -10
        
        // Use ship canvas object's actual position
        const x = shipObj.x
        const y = shipObj.y
        
        // Position bars above the ship
        const barY = y - ship.radius + yOffset
        const hullBarY = barY
        const shieldBarY = barY - barHeight - barSpacing
        
        const hullPercent = ship.hull[0] / ship.hull[1]
        const shieldPercent = ship.shields[0] / ship.shields[1]
        
        // Hull bar background (black)
        const hullBgId = `${idPrefix}-hull-bg-${ship.uuid}`
        let hullBg = this.routeCvs.getObject(hullBgId)
        if (!hullBg) {
            hullBg = this.routeCvs.addLine(
                hullBgId,
                x - barWidth / 2,
                hullBarY,
                x + barWidth / 2,
                hullBarY,
                COLORS.Black,
                barHeight
            )
            hullBg.zIndex = 100
        } else {
            hullBg.x = x - barWidth / 2
            hullBg.y = hullBarY
            hullBg.x2 = x + barWidth / 2
            hullBg.y2 = hullBarY
        }
        
        // Hull bar foreground (red/orange based on health)
        const hullColor = hullPercent < 0.3 ? COLORS.Red : COLORS.Orange
        const hullFgId = `${idPrefix}-hull-fg-${ship.uuid}`
        let hullFg = this.routeCvs.getObject(hullFgId)
        if (!hullFg) {
            hullFg = this.routeCvs.addLine(
                hullFgId,
                x - barWidth / 2,
                hullBarY,
                x - barWidth / 2 + barWidth * hullPercent,
                hullBarY,
                hullColor,
                barHeight - 2
            )
            hullFg.zIndex = 101
        } else {
            hullFg.x = x - barWidth / 2
            hullFg.y = hullBarY
            hullFg.x2 = x - barWidth / 2 + barWidth * hullPercent
            hullFg.y2 = hullBarY
            hullFg.strokeColor = hullColor
        }
        
        // Shield bar background (black)
        const shieldBgId = `${idPrefix}-shield-bg-${ship.uuid}`
        let shieldBg = this.routeCvs.getObject(shieldBgId)
        if (!shieldBg) {
            shieldBg = this.routeCvs.addLine(
                shieldBgId,
                x - barWidth / 2,
                shieldBarY,
                x + barWidth / 2,
                shieldBarY,
                COLORS.Black,
                barHeight
            )
            shieldBg.zIndex = 100
        } else {
            shieldBg.x = x - barWidth / 2
            shieldBg.y = shieldBarY
            shieldBg.x2 = x + barWidth / 2
            shieldBg.y2 = shieldBarY
        }
        
        // Shield bar foreground (blue/cyan)
        const shieldColor = COLORS.Blue
        const shieldFgId = `${idPrefix}-shield-fg-${ship.uuid}`
        let shieldFg = this.routeCvs.getObject(shieldFgId)
        if (!shieldFg) {
            shieldFg = this.routeCvs.addLine(
                shieldFgId,
                x - barWidth / 2,
                shieldBarY,
                x - barWidth / 2 + barWidth * shieldPercent,
                shieldBarY,
                shieldColor,
                barHeight - 2
            )
            shieldFg.zIndex = 101
        } else {
            shieldFg.x = x - barWidth / 2
            shieldFg.y = shieldBarY
            shieldFg.x2 = x - barWidth / 2 + barWidth * shieldPercent
            shieldFg.y2 = shieldBarY
        }

        console.log('✅ Added/updated progress bars for ship:', ship.shipType.name, shieldFg, hullFg, x, y, shieldPercent, hullPercent)
        console.log('Compare with ship canvas object:', shipObj)
    }
    
    /**
     * Renders ships with thrusters and jitter
     * Creates ship objects once, then updates their positions on subsequent calls
     */
    renderShips() {
        
        if (!this.routeCvs) {
            console.error('❌ renderShips: routeCvs is null!')
            return
        }
        
        if (!this.encounter || !this.encounter.playerShips) {
            console.error('❌ renderShips: encounter or playerShips is null!')
            return
        }
        
        const shipSpacing = COMBAT_MAP_CONFIG.shipSpacing
        const leftOffset = -(this.routeCvs.canvas.width / this.routeCvs.zoom) * Math.abs(COMBAT_MAP_CONFIG.playerShipsOffset)
        const rightOffset = (this.routeCvs.canvas.width / this.routeCvs.zoom) * COMBAT_MAP_CONFIG.enemyShipsOffset
        
        // Handle player ships fade-in animation
        if (!this.playerShipsFadedIn) {
            if (this.playerShipsOpacity === 0) {
                this.playerShipsFadeStartTime = Date.now()
            }
            const elapsed = Date.now() - this.playerShipsFadeStartTime
            const fadeTime = COMBAT_MAP_CONFIG.enemyFadeInDuration
            this.playerShipsOpacity = Math.min(1, elapsed / fadeTime)
            
            if (this.playerShipsOpacity >= 1) {
                this.playerShipsFadedIn = true
            }
        }
        
        // Update player ships
        this.encounter.playerShips.forEach((ship, index) => {
            if (ship.disabled) return
            
            const jitter = this.updateShipJitter(ship)
            const shipY = 0 + (index - (this.encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
            const shipX = leftOffset + jitter.x
            
            // Check if ship already exists on canvas
            const shipExists = this.shipsCreated.has(ship.uuid)
            
            // Create or update thruster
            const thrusterId = `thruster-player-${ship.uuid}`
            const thrusterObj = this.routeCvs.getObject(thrusterId)
            if (thrusterObj) {
                thrusterObj.x = shipX + (false ? ship.radius : -ship.radius)
                thrusterObj.y = shipY
            } else {
                this.renderThruster(ship, shipX, shipY)
            }
            
            // Create or update ship
            if (!shipExists) {
                this.renderShip(ship, shipX, shipY)
                this.shipsCreated.add(ship.uuid)
                
                // Apply fade-in to newly created player ship
                this.routeCvs.drawOrder.forEach(obj => {
                    if (obj.id && obj.id.includes(ship.uuid) && obj.id.startsWith('player-')) {
                        if (obj.fillColor && obj.fillColor.length >= 4) {
                            obj.fillColor[3] = Math.floor(1 * this.playerShipsOpacity)
                        }
                    }
                })
            } else {
                // Update positions of existing objects
                this.updateShipPosition(ship, shipX, shipY)
                
                // Continue fade-in if not complete
                if (!this.playerShipsFadedIn) {
                    this.routeCvs.drawOrder.forEach(obj => {
                        if (obj.id && obj.id.includes(ship.uuid) && obj.id.startsWith('player-')) {
                            if (obj.fillColor && obj.fillColor.length >= 4) {
                                obj.fillColor[3] = Math.floor(1 * this.playerShipsOpacity)
                            }
                        }
                    })
                }
            }
        })
        
        // Update enemy ships if they exist
        if (this.encounter.enemyShips && this.encounter.enemyShips.length > 0) {
            // Handle fade-in animation
            if (!this.enemyShipsFadedIn) {
                if (this.enemyShipsOpacity === 0) {
                    this.enemyShipsFadeStartTime = Date.now()
                }
                const elapsed = Date.now() - this.enemyShipsFadeStartTime
                const fadeTime = COMBAT_MAP_CONFIG.enemyFadeInDuration
                this.enemyShipsOpacity = Math.min(1, elapsed / fadeTime)
                
                if (this.enemyShipsOpacity >= 1) {
                    this.enemyShipsFadedIn = true
                }
            }
            
            this.encounter.enemyShips.forEach((ship, index) => {
                if (ship.disabled) return
                
                const jitter = this.updateShipJitter(ship)
                const shipY = 0 + (index - (this.encounter.enemyShips.length - 1) / 2) * shipSpacing + jitter.y
                const shipX = rightOffset + jitter.x
                
                // Check if ship already exists on canvas
                const shipExists = this.shipsCreated.has(ship.uuid)
                
                // Create or update thruster
                const thrusterId = `thruster-enemy-${ship.uuid}`
                const thrusterObj = this.routeCvs.getObject(thrusterId)
                if (thrusterObj) {
                    thrusterObj.x = shipX + (true ? ship.radius : -ship.radius)
                    thrusterObj.y = shipY
                } else {
                    this.renderThruster(ship, shipX, shipY)
                }
                
                // Create or update ship
                if (!shipExists) {
                    this.renderShip(ship, shipX, shipY)
                    this.shipsCreated.add(ship.uuid)
                    
                    // Apply fade-in to newly created enemy ship
                    this.routeCvs.drawOrder.forEach(obj => {
                        if (obj.id && obj.id.includes(ship.uuid) && obj.id.startsWith('enemy-')) {
                            if (obj.fillColor && obj.fillColor.length >= 4) {
                                obj.fillColor[3] = Math.floor(1 * this.enemyShipsOpacity)
                            }
                        }
                    })
                } else {
                    this.updateShipPosition(ship, shipX, shipY)
                    
                    // Continue fade-in if not complete
                    if (!this.enemyShipsFadedIn) {
                        this.routeCvs.drawOrder.forEach(obj => {
                            if (obj.id && obj.id.includes(ship.uuid) && obj.id.startsWith('enemy-')) {
                                if (obj.fillColor && obj.fillColor.length >= 4) {
                                    obj.fillColor[3] = Math.floor(1 * this.enemyShipsOpacity)
                                }
                            }
                        })
                    }
                }
            })
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
        const isPlayer = this.isPlayerShip(ship)
        const idPrefix = isPlayer ? 'player' : 'enemy'
        
        // Update polygons or circle
        if (ship.shipType.shipShape && ship.shipType.shipShape.toPolygons) {
            const shipColor = gs.fleet && gs.fleet.color ? gs.fleet.color : COLORS.White
            const shipSize = COMBAT_MAP_CONFIG.shipSize
            const polygons = ship.shipType.shipShape.toPolygons(shipColor, shipSize)
            polygons.forEach((poly) => {
                const obj = this.routeCvs.getObject(`${idPrefix}-${ship.uuid}-poly-${poly.id}`)
                if (obj) {
                    obj.x = x
                    obj.y = y
                }
            })
        } else {
            const obj = this.routeCvs.getObject(`${idPrefix}-${ship.uuid}`)
            if (obj) {
                obj.x = x
                obj.y = y
            }
        }
        
        // Update label
        const label = this.routeCvs.getObject(`${idPrefix}-label-${ship.uuid}`)
        if (label) {
            label.x = x
            label.y = y
        }
        
        // Get the ship's main canvas object and update progress bars
        let shipObj
        if (ship.shipType.shipShape && ship.shipType.shipShape.toPolygons) {
            shipObj = this.routeCvs.getObject(`${idPrefix}-${ship.uuid}-poly-0`)
        } else {
            shipObj = this.routeCvs.getObject(`${idPrefix}-${ship.uuid}`)
        }
        
        // Update progress bars
        if (shipObj) {
            this.addShipProgressBars(ship, shipObj)
        }
    }

    animateRouteTravel() {
        // If we're in travel mode (gs.destination is set), use custom travel animation
        if (gs.destination && gs.travelYearsRemaining !== null) {
            this.animateTravelMode()
            return
        }
        
        const centerX = this.routeCvs.canvas.width / 2
        const centerY = this.routeCvs.canvas.height / 2
        const shipSpacing = 60
        
        const animate = () => {
            // Calculate elapsed time and update progress
            const currentTime = Date.now()
            const elapsedMs = currentTime - this.lastTickMs
            this.lastTickMs = currentTime
            
            this.routeProgress += elapsedMs * COMBAT_MAP_PROGRESS_PERCENT_PER_MS
            this.routeProgress = Math.min(this.routeProgress, 100)
            
            // Update progress bar if it exists
            if (this.routeProgressBar) {
                this.routeProgressBar.update(this.routeProgress)
            }
            
            // Update ship positions (ships already created by renderShips)
            this.encounter.playerShips.forEach((ship, index) => {
                if (ship.disabled) return
                
                const jitter = this.updateShipJitter(ship, 10, 30)
                const leftOffset = centerX * 0.5 // 75% to left (centerX = 50%, so 0.5 * centerX = 25% from left)
                const shipY = centerY + (index - (this.encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
                const shipX = leftOffset + jitter.x
                
                this.updateShipPosition(ship, shipX, shipY)
                
                // Update thruster position
                const isPlayer = this.isPlayerShip(ship)
                const idPrefix = isPlayer ? 'player' : 'enemy'
                const thrusterId = `thruster-${idPrefix}-${ship.uuid}`
                const thrusterObj = this.routeCvs.getObject(thrusterId)
                if (thrusterObj) {
                    thrusterObj.x = shipX + (isPlayer ? -ship.radius : ship.radius)
                    thrusterObj.y = shipY
                }
            })
            
            // Update enemy ship positions if they exist
            if (this.encounter.enemyShips && this.encounter.enemyShips.length > 0) {
                this.encounter.enemyShips.forEach((ship, index) => {
                    if (ship.disabled) return
                    
                    const jitter = this.updateShipJitter(ship, 10, 30)
                    const rightOffset = centerX * 1.5 // 75% to right
                    const shipY = centerY + (index - (this.encounter.enemyShips.length - 1) / 2) * shipSpacing + jitter.y
                    const shipX = rightOffset + jitter.x
                    
                    this.updateShipPosition(ship, shipX, shipY)
                    
                    // Update thruster position
                    const isPlayer = this.isPlayerShip(ship)
                    const idPrefix = isPlayer ? 'player' : 'enemy'
                    const thrusterId = `thruster-${idPrefix}-${ship.uuid}`
                    const thrusterObj = this.routeCvs.getObject(thrusterId)
                    if (thrusterObj) {
                        thrusterObj.x = shipX + (isPlayer ? -ship.radius : ship.radius)
                        thrusterObj.y = shipY
                    }
                })
            }
            
            this.routeCvs.redraw(true)
            
            // Continue animation
            this.routeAnimationFrame = requestAnimationFrame(animate)
        }
        
        animate()
    }

    /**
     * Animates ships during travel mode (using GameState travel progress)
     */
    animateTravelMode() {
        const centerX = this.routeCvs.canvas.width / 2
        const centerY = this.routeCvs.canvas.height / 2
        const shipSpacing = 60
        
        const animate = () => {
            if (!gs.destination || gs.travelYearsRemaining === null) {
                // Travel ended
                if (this.encounter && this.encounter.endEncounter) {
                    this.encounter.endEncounter()
                }
                return
            }
            
            // Calculate progress based on start ETA vs remaining ETA
            let progressPercent = 0
            if (gs.travelStartYear !== null && gs.destination && gs.previousLocation) {
                const totalDistance = calcDistance(gs.previousLocation.x, gs.previousLocation.y, gs.destination.x, gs.destination.y)
                const startETA = totalDistance / gs.fleet.speed
                const remainingETA = gs.travelYearsRemaining || 0
                progressPercent = startETA > 0 ? ((startETA - remainingETA) / startETA) * 100 : 0
            }
            
            // Update progress bar
            if (this.routeProgressBar) {
                this.routeProgressBar.update(progressPercent)
            }
            
            // Update ETA display
            if (this.routeETAEl) {
                this.routeETAEl.innerHTML = `ETA: ${describeTimespan(gs.travelYearsRemaining || 0, 1)}`
            }
            
            // Update player ship positions (ships already created by renderShips)
            this.encounter.playerShips.forEach((ship, index) => {
                if (ship.disabled) return
                
                const jitter = this.updateShipJitter(ship, 10, 30)
                const leftOffset = centerX * 0.5 // 75% to left (centerX = 50%, so 0.5 * centerX = 25% from left)
                const shipY = centerY + (index - (this.encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
                const shipX = leftOffset + jitter.x
                
                this.updateShipPosition(ship, shipX, shipY)
                
                // Update thruster position
                const isPlayer = this.isPlayerShip(ship)
                const idPrefix = isPlayer ? 'player' : 'enemy'
                const thrusterId = `thruster-${idPrefix}-${ship.uuid}`
                const thrusterObj = this.routeCvs.getObject(thrusterId)
                if (thrusterObj) {
                    thrusterObj.x = shipX + (isPlayer ? -ship.radius : ship.radius)
                    thrusterObj.y = shipY
                }
            })
            
            // Update enemy ship positions if they exist
            if (this.encounter.enemyShips && this.encounter.enemyShips.length > 0) {
                this.encounter.enemyShips.forEach((ship, index) => {
                    if (ship.disabled) return
                    
                    const jitter = this.updateShipJitter(ship, 10, 30)
                    const rightOffset = centerX * 1.5 // 75% to right
                    const shipY = centerY + (index - (this.encounter.enemyShips.length - 1) / 2) * shipSpacing + jitter.y
                    const shipX = rightOffset + jitter.x
                    
                    this.updateShipPosition(ship, shipX, shipY)
                    
                    // Update thruster position
                    const isPlayer = this.isPlayerShip(ship)
                    const idPrefix = isPlayer ? 'player' : 'enemy'
                    const thrusterId = `thruster-${idPrefix}-${ship.uuid}`
                    const thrusterObj = this.routeCvs.getObject(thrusterId)
                    if (thrusterObj) {
                        thrusterObj.x = shipX + (isPlayer ? -ship.radius : ship.radius)
                        thrusterObj.y = shipY
                    }
                })
            }
            
            this.routeCvs.redraw(true)
            
            // Check if travel completed
            if (gs.travelYearsRemaining <= 0 || gs.travelProgress >= 100) {
                console.log('Travel completed')
                
                // Trigger encounter end to return to star map
                if (this.encounter && this.encounter.endEncounter) {
                    this.encounter.endEncounter()
                }
                return
            }
            
            // Continue animation
            this.routeAnimationFrame = requestAnimationFrame(animate)
        }
        
        animate()
    }

    /**
     * Creates a ship formation (column of ships)
     * @param {Ship[]} ships
     * @returns {HTMLElement}
     */
    createShipFormation(ships) {
        const isPlayer = ships.length > 0 && this.isPlayerShip(ships[0])
        const side = isPlayer ? 'player' : 'enemy'
        const formation = ce({
            classNames: ['ship-formation', `${side}-formation`],
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '40px',
                alignItems: 'center',
                backgroundColor: side === 'enemy' ? 'magenta' : 'transparent'
            }
        })
        
        ships.forEach((ship, index) => {
            const shipElement = this.createShipElement(ship)
            formation.appendChild(shipElement)
        })
        
        return formation
    }

    /**
     * Creates a ship element for the combat map
     * @param {Ship} ship
     * @returns {HTMLElement}
     */
    createShipElement(ship) {
        const isPlayer = this.isPlayerShip(ship)
        const side = isPlayer ? 'player' : 'enemy'
        const isDestroyed = ship.disabled
        const isSelected = (isPlayer && ship === this.selectedPlayerShip) || (!isPlayer && ship === this.selectedEnemyShip)
    
    const classNames = ['combat-ship', `${side}-ship`]
    if (isSelected) classNames.push('selected')
    
    const shipEl = ce({
        classNames,
        style: {
            width: '120px',
            minHeight: '80px',
            backgroundColor: isDestroyed ? '#444' : (isPlayer ? '#00ff00' : '#ff0000'),
            border: '2px solid ' + (isSelected ? '#ffff00' : (isPlayer ? '#00aa00' : '#aa0000')),
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: isDestroyed ? 'not-allowed' : 'pointer',
            position: 'relative',
            transform: isPlayer ? 'scaleX(1)' : 'scaleX(-1)', // Mirror enemy ships
            transition: 'all 0.3s',
            opacity: isDestroyed ? 0.3 : 1,
            padding: '8px'
        },
        children: [
            ce({
                innerHTML: ship.shipType.name,
                style: {
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transform: isPlayer ? 'none' : 'scaleX(-1)', // Un-mirror text
                    pointerEvents: 'none',
                    marginBottom: '4px'
                }
            }),
            ce({
                innerHTML: `Hull: ${ship.hull[0]}/${ship.hull[1]}`,
                style: {
                    color: ship.hull[0] / ship.hull[1] < 0.3 ? '#ff6666' : '#fff',
                    fontSize: '10px',
                    transform: isPlayer ? 'none' : 'scaleX(-1)', // Un-mirror text
                    pointerEvents: 'none'
                }
            }),
            ce({
                innerHTML: `Shields: ${ship.shields[0]}/${ship.shields[1]}`,
                style: {
                    color: ship.shields[0] > 0 ? '#6666ff' : '#888',
                    fontSize: '10px',
                    transform: isPlayer ? 'none' : 'scaleX(-1)', // Un-mirror text
                    pointerEvents: 'none'
                }
            }),
            ce({
                innerHTML: `Lasers: ${ship.lasers}`,
                style: {
                    color: ship.lasers > 0 ? '#ffff66' : '#888',
                    fontSize: '10px',
                    transform: isPlayer ? 'none' : 'scaleX(-1)', // Un-mirror text
                    pointerEvents: 'none'
                }
            })
        ]
    })
    
        // Click to select
        if (!isDestroyed) {
            shipEl.addEventListener('click', () => {
                if (isPlayer) {
                    this.selectedPlayerShip = ship
                } else {
                    this.selectedEnemyShip = ship
                }
                this.refreshCombatMap()
            })
        
        // Highlight on hover
        shipEl.addEventListener('mouseenter', () => {
            shipEl.style.boxShadow = '0 0 20px ' + (isPlayer ? '#00ff00' : '#ff0000')
            shipEl.style.transform = isPlayer ? 'scaleX(1.1)' : 'scaleX(-1.1)'
        })
        
            shipEl.addEventListener('mouseleave', () => {
                shipEl.style.boxShadow = 'none'
                shipEl.style.transform = isPlayer ? 'scaleX(1)' : 'scaleX(-1)'
            })
        }
        
        return shipEl
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
