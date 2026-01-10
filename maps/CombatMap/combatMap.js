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
        this.enemyShipsFadedIn = false
        this.enemyShipsOpacity = 0
        this.enemyShipsFadeStartTime = 0
        this.shipsCreated = false // Track whether we've created ship objects on canvas
        
        // Route travel UI element references (set by route handler)
        this.routeDistanceEl = null
        this.routeETAEl = null
        
        // Determine mode
        this.hasEnemies = gs.combat && gs.combat.enemyShips && gs.combat.enemyShips.length > 0
        
        // Initialize handlers
        this.combatHandler = new CombatMapCombatHandler(this)
        this.routeHandler = new CombatMapRouteHandler(this)
        
        if (this.hasEnemies) {
            // Combat mode
            this.selectedPlayerShip = gs.combat.activePlayerShips[0] || null
            this.selectedEnemyShip = gs.combat.activeEnemyShips[0] || null
        }
        
        // Create container
        this.root = ce({id: 'combat-map-container'})
        
        // Create canvas for rendering
        this.routeCvs = new CanvasWrapper(1, 1, 1, 0, false, false)
        this.root.appendChild(this.routeCvs.root)
        
        // Create UI panel at bottom
        if (this.hasEnemies) {
            this.uiPanel = this.combatHandler.createCombatUIPanel()
        } else {
            this.uiPanel = this.routeHandler.createRouteTravelUIPanel()
            // Initialize tick system for travel mode
            this.lastTickMs = Date.now()
        }
        this.root.appendChild(this.uiPanel)
        
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
            
            // Start animation/tick loop
            if (this.hasEnemies) {
                this.startCombatAnimation()
            } else {
                this.routeHandler.tick()
            }
        })
    }
    
    /**
     * Starts the combat animation loop
     * This runs independently of pause state to ensure enemy ships fade in properly
     */
    startCombatAnimation() {
        const animate = () => {
            // Always render ships to allow fade-in to complete
            this.renderShips()
            
            // Continue animating indefinitely (not just during fade)
            // This ensures smooth rendering even when modal is shown
            this.routeAnimationFrame = requestAnimationFrame(animate)
        }
        animate()
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
        const thrusterColor = [255, Math.floor(150 * thrusterFlicker), 0, Math.floor(255 * thrusterFlicker)]
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
        const shipColor = gs.fleet && gs.fleet.color ? gs.fleet.color : [0, 255, 0, 255]
        
        if (ship.shipType.shipShape && ship.shipType.shipShape.toPolygons) {
            // Use ship shape polygons
            const polygons = ship.shipType.shipShape.toPolygons(shipColor, shipSize)
            polygons.forEach((poly) => {
                const vertices = mirror ? invertPolygons(poly.vertices) : poly.vertices
                this.routeCvs.addPolygon(
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
            })
        } else {
            // Fallback to circle if no shape generator
            this.routeCvs.addFilledCircle(
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
            [255, 255, 255, 255],
            12
        )
        
        // Add progress bar container above ship
        this.addShipProgressBars(ship, x, y)
    }
    
    /**
     * Adds HTML progress bars for hull and shields above a ship
     * @param {Ship} ship
     * @param {number} x - Canvas X position
     * @param {number} y - Canvas Y position
     */
    addShipProgressBars(ship, x, y) {
        const isPlayer = this.isPlayerShip(ship)
        const idPrefix = isPlayer ? 'player' : 'enemy'
        const existingBar = document.getElementById(`${idPrefix}-bars-${ship.uuid}`)
        if (existingBar) existingBar.remove()
        
        // Convert canvas coords to screen coords
        const rect = this.routeCvs.canvas.getBoundingClientRect()
        const screenX = rect.left + x + this.routeCvs.canvas.width / 2
        const screenY = rect.top + y + this.routeCvs.canvas.height / 2 - ship.radius + COMBAT_MAP_CONFIG.progressBarOffsetY
        
        const hullPercent = ship.hull[0] / ship.hull[1]
        const hullClass = hullPercent < 0.3 ? 'ship-progress-bar-hull-low' : 'ship-progress-bar-hull'
        
        const barContainer = ce({
            id: `${idPrefix}-bars-${ship.uuid}`,
            classNames: ['ship-progress-bars'],
            style: {
                left: screenX + 'px',
                top: screenY + 'px'
            },
            children: [
                // Hull bar
                ce({
                    classNames: ['ship-progress-bar'],
                    children: [ce({
                        classNames: ['ship-progress-bar-fill', hullClass],
                        style: {width: (hullPercent * 100) + '%'}
                    })]
                }),
                // Shields bar
                ce({
                    classNames: ['ship-progress-bar'],
                    children: [ce({
                        classNames: ['ship-progress-bar-fill', 'ship-progress-bar-shields'],
                        style: {width: (ship.shields[0] / ship.shields[1] * 100) + '%'}
                    })]
                })
            ]
        })
        
        document.body.appendChild(barContainer)
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
        
        // Update player ships
        this.encounter.playerShips.forEach((ship, index) => {
            if (this.isShipDestroyed(ship)) return
            
            const jitter = this.updateShipJitter(ship)
            const shipY = 0 + (index - (this.encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
            const shipX = leftOffset + jitter.x
            
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
            if (!this.shipsCreated) {
                this.renderShip(ship, shipX, shipY)
            } else {
                // Just update positions of existing objects
                this.updateShipPosition(ship, shipX, shipY)
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
                if (this.isShipDestroyed(ship)) return
                
                const jitter = this.updateShipJitter(ship)
                const shipY = 0 + (index - (this.encounter.enemyShips.length - 1) / 2) * shipSpacing + jitter.y
                const shipX = rightOffset + jitter.x
                
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
                if (!this.shipsCreated) {
                    this.renderShip(ship, shipX, shipY)
                } else {
                    this.updateShipPosition(ship, shipX, shipY)
                }
                
                // Update opacity during fade-in
                if (!this.enemyShipsFadedIn) {
                    this.routeCvs.drawOrder.forEach(obj => {
                        if (obj.id && obj.id.startsWith('enemy-')) {
                            if (obj.fillColor && obj.fillColor.length >= 4) {
                                obj.fillColor[3] = Math.floor(255 * this.enemyShipsOpacity)
                            }
                        }
                    })
                }
            })
        }
        
        // Mark ships as created after first render
        if (!this.shipsCreated) {
            this.shipsCreated = true
            console.log('✅ Ships created on canvas')
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
            const shipColor = gs.fleet && gs.fleet.color ? gs.fleet.color : [0, 255, 0, 255]
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
        
        // Update progress bars
        this.addShipProgressBars(ship, x, y)
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
                if (this.isShipDestroyed(ship)) return
                
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
                    if (this.isShipDestroyed(ship)) return
                    
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
            
            // Check if we should trigger an encounter
            if (this.routeProgress >= 100) {
                // Stop animation and trigger encounter
                this.cleanup()
                
                // Trigger next encounter
                console.log('Route progress complete - triggering encounter')
                if (this.encounter) {
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
     * Animates ships during travel mode (using GameState travel progress)
     */
    animateTravelMode() {
        const centerX = this.routeCvs.canvas.width / 2
        const centerY = this.routeCvs.canvas.height / 2
        const shipSpacing = 60
        
        const animate = () => {
            if (!gs.destination || gs.travelYearsRemaining === null) {
                // Travel ended
                this.cleanup()
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
                if (this.isShipDestroyed(ship)) return
                
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
                    if (this.isShipDestroyed(ship)) return
                    
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
                this.cleanup()
                
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
        const isDestroyed = this.isShipDestroyed(ship)
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
    }

    /**
     * Checks if a ship is destroyed
     * @param {Ship} ship
     * @returns {boolean}
     */
    isShipDestroyed(ship) {
        return ship.hull[0] <= 0
    }

}

/**
 * Factory function to create and show a combat map
 * @param {Encounter} encounter
 * @returns {CombatMap}
 */
function showCombatMap(encounter) {
    return new CombatMap(encounter)
}

/**
 * Shows encounter visual (ships on canvas) without entering combat mode
 * Used to display ships in background while encounter modal is showing
 * Creates canvas with background stars ONCE - this canvas is reused by CombatMap
 * @param {Encounter} encounter
 */
function showEncounterVisual(encounter) {
    // Remove any existing encounter visual
    const existing = document.getElementById('encounter-visual-container')
    if (existing) existing.remove()
    
    // Create container
    const container = ce({
        id: 'encounter-visual-container',
        style: {
            width: '100%',
            height: '100vh',
            backgroundColor: '#000',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '0',
            overflow: 'hidden',
            pointerEvents: 'none'
        }
    })
    
    // Create ONE canvas for everything (stars + ships)
    const cvs = new CanvasWrapper(1, 1, 1, 0, false, false)
    cvs.root.style.position = 'absolute'
    cvs.root.style.top = '0'
    cvs.root.style.left = '0'
    cvs.root.style.width = '100%'
    cvs.root.style.height = '100%'
    container.appendChild(cvs.root)
    
    document.body.appendChild(container)
    
    // Render stars and ships after DOM is ready
    requestAnimationFrame(() => {
        cvs.autoResize()
        cvs.cameraX = 0
        cvs.cameraY = 0
        cvs.zoom = 60
        
        // Generate and render stars ONCE using addPixel
        const radius = Math.max(window.innerWidth, window.innerHeight)
        const numStars = COMBAT_MAP_CONFIG.starfieldStarCount
        const backgroundStars = generateBackgroundStars(radius, numStars)
        backgroundStars.forEach((star) => {
            const x = Math.random() * cvs.canvas.width
            const y = Math.random() * cvs.canvas.height
            const size = Math.random() * 2 + 0.5
            cvs.addPixel(0, 0, star.color, size, x, y, true)
        })
        console.log('✨ Stars rendered once to canvas')
        
        // Animation state
        const shipJitterOffsets = new Map()
        let enemyShipsOpacity = 0
        let enemyShipsFadedIn = false
        let enemyShipsFadeStartTime = Date.now()
        let shipsCreated = false
        
        const renderEncounterShips = () => {
            const shipSpacing = 60
            const leftOffset = -(cvs.canvas.width / cvs.zoom) * 0.375
            const rightOffset = (cvs.canvas.width / cvs.zoom) * 0.375
            
            // Helper to update jitter
            const updateJitter = (ship) => {
                if (!shipJitterOffsets.has(ship)) {
                    const initialTargetX = (Math.random() - 0.5) * 2
                    const initialTargetY = (Math.random() - 0.5) * 1
                    shipJitterOffsets.set(ship, {x: 0, y: 0, targetX: initialTargetX, targetY: initialTargetY})
                }
                const jitter = shipJitterOffsets.get(ship)
                if (Math.random() < 0.03) {
                    jitter.targetX = (Math.random() - 0.5) * 2
                    jitter.targetY = (Math.random() - 0.5) * 1
                }
                jitter.x += (jitter.targetX - jitter.x) * 0.1
                jitter.y += (jitter.targetY - jitter.y) * 0.1
                return jitter
            }
            
            // Update player ships
            if (encounter.playerShips) {
                encounter.playerShips.forEach((ship, index) => {
                    const jitter = updateJitter(ship)
                    const shipY = (index - (encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
                    const shipX = leftOffset + jitter.x
                    
                    const shipColor = gs.fleet && gs.fleet.color ? gs.fleet.color : [0, 255, 0, 255]
                    
                    // Create or update ship
                    const shipObj = cvs.getObject(`player-${ship.uuid}`)
                    if (shipObj) {
                        shipObj.x = shipX
                        shipObj.y = shipY
                    } else {
                        cvs.addFilledCircle(`player-${ship.uuid}`, shipX, shipY, 20, 5, shipColor)
                    }
                })
            }
            
            // Update enemy ships with fade-in
            if (encounter.enemyShips && encounter.enemyShips.length > 0) {
                if (!enemyShipsFadedIn) {
                    const elapsed = Date.now() - enemyShipsFadeStartTime
                    enemyShipsOpacity = Math.min(1, elapsed / 2000)
                    if (enemyShipsOpacity >= 1) enemyShipsFadedIn = true
                }
                
                encounter.enemyShips.forEach((ship, index) => {
                    const jitter = updateJitter(ship)
                    const shipY = (index - (encounter.enemyShips.length - 1) / 2) * shipSpacing + jitter.y
                    const shipX = rightOffset + jitter.x
                    
                    const shipColor = [255, 0, 0, Math.floor(255 * enemyShipsOpacity)]
                    
                    // Create or update ship
                    const shipObj = cvs.getObject(`enemy-${ship.uuid}`)
                    if (shipObj) {
                        shipObj.x = shipX
                        shipObj.y = shipY
                        // Update opacity during fade-in
                        if (!enemyShipsFadedIn && shipObj.fillColor) {
                            shipObj.fillColor[3] = Math.floor(255 * enemyShipsOpacity)
                        }
                    } else {
                        cvs.addFilledCircle(`enemy-${ship.uuid}`, shipX, shipY, 20, 5, shipColor)
                    }
                })
            }
            
            if (!shipsCreated && cvs.objectMap.size > 0) {
                shipsCreated = true
                console.log('✅ Encounter ships created on canvas')
            }
            
            cvs.redraw(true)
            
            // Continue animation
            requestAnimationFrame(renderEncounterShips)
        }
        
        renderEncounterShips()
    })
}
