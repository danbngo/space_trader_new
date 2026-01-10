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
        
        // Initialize main container
        this.root = ce({id: 'combat-map-container'})
        
        // Create starfield background
        const starfieldCanvas = this.createStarfield()
        this.root.appendChild(starfieldCanvas)
        
        // Create canvas for ships
        this.routeCvs = new CanvasWrapper(1, 1, 1, 0, false, false)
        this.routeCvs.root.id = 'combat-canvas-wrapper'
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
     * @param {number} index - Ship index for unique ID
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} mirror - Whether to mirror the thruster horizontally
     */
    renderThruster(ship, index, x, y, mirror = false) {
        const flickerRange = COMBAT_MAP_CONFIG.thrusterFlickerMax - COMBAT_MAP_CONFIG.thrusterFlickerMin
        const thrusterFlicker = COMBAT_MAP_CONFIG.thrusterFlickerMin + Math.random() * flickerRange
        const thrusterSize = ship.radius * COMBAT_MAP_CONFIG.thrusterSizeMultiplier * thrusterFlicker
        const thrusterColor = [255, Math.floor(150 * thrusterFlicker), 0, Math.floor(255 * thrusterFlicker)]
        const offsetX = mirror ? ship.radius : -ship.radius
        const rotation = mirror ? 0 : Math.PI
        this.routeCvs.addFilledTriangle(
            `thruster-${index}`,
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
     * @param {number} index - Ship index for unique ID
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} shipSize - Size of the ship
     * @param {number} labelOffsetY - Y offset for label
     * @param {boolean} mirror - Whether to mirror the ship horizontally
     * @param {string} idPrefix - Prefix for object IDs (e.g., 'player' or 'enemy')
     */
    renderShip(ship, index, x, y, shipSize = 20, labelOffsetY = 0, mirror = false, idPrefix = 'ship') {
        const shipColor = gs.fleet && gs.fleet.color ? gs.fleet.color : [0, 255, 0, 255]
        
        if (ship.shipType.shipShape && ship.shipType.shipShape.toPolygons) {
            // Use ship shape polygons
            const polygons = ship.shipType.shipShape.toPolygons(shipColor, shipSize)
            polygons.forEach((poly) => {
                const vertices = mirror ? invertPolygons(poly.vertices) : poly.vertices
                this.routeCvs.addPolygon(
                    `${idPrefix}-${index}-poly-${poly.id}`,
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
                `${idPrefix}-${index}`,
                x,
                y,
                shipSize,
                5,
                shipColor
            )
        }
        
        // Add ship label
        this.routeCvs.addText(
            `${idPrefix}-label-${index}`,
            x,
            y-ship.radius,
            0,
            labelOffsetY,
            ship.shipType.name,
            [255, 255, 255, 255],
            12
        )
        
        // Add progress bar container above ship
        this.addShipProgressBars(ship, index, x, y, idPrefix)
    }
    
    /**
     * Adds HTML progress bars for hull and shields above a ship
     * @param {Ship} ship
     * @param {number} index
     * @param {number} x - Canvas X position
     * @param {number} y - Canvas Y position  
     * @param {string} idPrefix
     */
    addShipProgressBars(ship, index, x, y, idPrefix) {
        const existingBar = document.getElementById(`${idPrefix}-bars-${index}`)
        if (existingBar) existingBar.remove()
        
        // Convert canvas coords to screen coords
        const rect = this.routeCvs.canvas.getBoundingClientRect()
        const screenX = rect.left + x + this.routeCvs.canvas.width / 2
        const screenY = rect.top + y + this.routeCvs.canvas.height / 2 - ship.radius + COMBAT_MAP_CONFIG.progressBarOffsetY
        
        const hullPercent = ship.hull[0] / ship.hull[1]
        const hullClass = hullPercent < 0.3 ? 'ship-progress-bar-hull-low' : 'ship-progress-bar-hull'
        
        const barContainer = ce({
            id: `${idPrefix}-bars-${index}`,
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
        
        // Clear canvas objects (but preserve starfield pixels)
        this.routeCvs.clear()
        
        const shipSpacing = COMBAT_MAP_CONFIG.shipSpacing
        const leftOffset = -(this.routeCvs.canvas.width / this.routeCvs.zoom) * Math.abs(COMBAT_MAP_CONFIG.playerShipsOffset)
        const rightOffset = (this.routeCvs.canvas.width / this.routeCvs.zoom) * COMBAT_MAP_CONFIG.enemyShipsOffset
        
        // Draw player ships with jitter and thruster
        this.encounter.playerShips.forEach((ship, index) => {
            if (this.isShipDestroyed(ship)) return
            
            const jitter = this.updateShipJitter(ship)
            const shipY = 0 + (index - (this.encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
            const shipX = leftOffset + jitter.x
            
            this.renderThruster(ship, index, shipX, shipY, false)
            this.renderShip(ship, index, shipX, shipY, COMBAT_MAP_CONFIG.shipSize, COMBAT_MAP_CONFIG.labelOffsetY, false, 'player')
        })
        
        // Draw enemy ships if they exist
        if (this.encounter.enemyShips && this.encounter.enemyShips.length > 0) {
            // Start fade-in animation if not already started
            if (!this.enemyShipsFadedIn) {
                this.enemyShipsOpacity = 0
                this.enemyShipsFadeStartTime = Date.now()
            }
            
            this.encounter.enemyShips.forEach((ship, index) => {
                if (this.isShipDestroyed(ship)) return
                
                const jitter = this.updateShipJitter(ship)
                const shipY = 0 + (index - (this.encounter.enemyShips.length - 1) / 2) * shipSpacing + jitter.y
                const shipX = rightOffset + jitter.x
                
                this.renderThruster(ship, index, shipX, shipY, true)
                this.renderShip(ship, index, shipX, shipY, COMBAT_MAP_CONFIG.shipSize, COMBAT_MAP_CONFIG.labelOffsetY, true, 'enemy')
            })
            
            // Update fade-in animation
            if (!this.enemyShipsFadedIn) {
                const elapsed = Date.now() - this.enemyShipsFadeStartTime
                const fadeTime = COMBAT_MAP_CONFIG.enemyFadeInDuration
                this.enemyShipsOpacity = Math.min(1, elapsed / fadeTime)
                
                // Apply opacity to all enemy ship objects
                this.routeCvs.drawOrder.forEach(obj => {
                    if (obj.id && obj.id.startsWith('enemy-')) {
                        if (obj.fillColor && obj.fillColor.length >= 4) {
                            obj.fillColor[3] = Math.floor(255 * this.enemyShipsOpacity)
                        }
                    }
                })
                
                if (this.enemyShipsOpacity >= 1) {
                    this.enemyShipsFadedIn = true
                }
            }
        }
        
        this.routeCvs.redraw(true)
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
            // Clear canvas objects (preserve starfield)
            this.routeCvs.clear()
            
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
            
            // Draw player ships with jitter and thruster
            this.encounter.playerShips.forEach((ship, index) => {
                if (this.isShipDestroyed(ship)) return
                
                const jitter = this.updateShipJitter(ship, 10, 30)
                const leftOffset = centerX * 0.5 // 75% to left (centerX = 50%, so 0.5 * centerX = 25% from left)
                const shipY = centerY + (index - (this.encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
                const shipX = leftOffset + jitter.x
                
                this.renderThruster(ship, index, shipX, shipY, false)
                this.renderShip(ship, index, shipX, shipY, 20, -30, false, 'player')
            })
            
            // Draw enemy ships if they exist
            if (this.encounter.enemyShips && this.encounter.enemyShips.length > 0) {
                this.encounter.enemyShips.forEach((ship, index) => {
                    if (this.isShipDestroyed(ship)) return
                    
                    const jitter = this.updateShipJitter(ship, 10, 30)
                    const rightOffset = centerX * 1.5 // 75% to right
                    const shipY = centerY + (index - (this.encounter.enemyShips.length - 1) / 2) * shipSpacing + jitter.y
                    const shipX = rightOffset + jitter.x
                    
                    this.renderThruster(ship, index, shipX, shipY, true)
                    this.renderShip(ship, index, shipX, shipY, 20, -30, true, 'enemy')
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

            // Clear canvas objects
            this.routeCvs.clear()
            this.routeCvs.pixels = [] // Keep background stars
            
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
            
            // Draw player ships with jitter and thruster
            this.encounter.playerShips.forEach((ship, index) => {
                if (this.isShipDestroyed(ship)) return
                
                const jitter = this.updateShipJitter(ship, 10, 30)
                const leftOffset = centerX * 0.5 // 75% to left (centerX = 50%, so 0.5 * centerX = 25% from left)
                const shipY = centerY + (index - (this.encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
                const shipX = leftOffset + jitter.x
                
                this.renderThruster(ship, index, shipX, shipY, false)
                this.renderShip(ship, index, shipX, shipY, 20, -30, false, 'player')
            })
            
            // Draw enemy ships if they exist
            if (this.encounter.enemyShips && this.encounter.enemyShips.length > 0) {
                this.encounter.enemyShips.forEach((ship, index) => {
                    if (this.isShipDestroyed(ship)) return
                    
                    const jitter = this.updateShipJitter(ship, 10, 30)
                    const rightOffset = centerX * 1.5 // 75% to right
                    const shipY = centerY + (index - (this.encounter.enemyShips.length - 1) / 2) * shipSpacing + jitter.y
                    const shipX = rightOffset + jitter.x
                    
                    this.renderThruster(ship, index, shipX, shipY, true)
                    this.renderShip(ship, index, shipX, shipY, 20, -30, true, 'enemy')
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
     * Creates a starfield background using CanvasWrapper
     * @returns {HTMLElement}
     */
    createStarfield() {
        // Create canvas wrapper for starfield
        const cvs = new CanvasWrapper(1, 1, 1, 0, false, false)
        cvs.canvas.id = 'combat-starfield'
        cvs.canvas.style.position = 'absolute'
        cvs.canvas.style.top = '0'
        cvs.canvas.style.left = '0'
        cvs.canvas.style.width = '100%'
        cvs.canvas.style.height = '100%'
        cvs.canvas.style.zIndex = '0'
        
        // Size the canvas
        cvs.canvas.width = window.innerWidth
        cvs.canvas.height = window.innerHeight
        
        // Generate background stars using generator
        const radius = Math.max(window.innerWidth, window.innerHeight)
        const numStars = COMBAT_MAP_CONFIG.starfieldStarCount
        const backgroundStars = generateBackgroundStars(radius, numStars)
        
        // Add stars to canvas as pixels with random screen positions
        backgroundStars.forEach((star, i) => {
            const x = Math.random() * cvs.canvas.width
            const y = Math.random() * cvs.canvas.height
            const size = Math.random() * 2 + 0.5 // Size between 0.5 and 2.5
            
            // Add pixel with parallax = true (static screen position)
            cvs.addPixel(0, 0, star.color, size, x, y, true)
        })
        
        // Redraw the canvas
        cvs.redraw(true)
        
        return cvs.canvas
    }

    /**
     * Creates the main combat area with ship formations
     * @returns {HTMLElement}
     */
    createCombatArea() {
        const area = ce({
            id: 'combat-area',
            style: {
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: '90%',
                height: '60%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: '1'
            }
        })
        
        // Player fleet on the left
        const playerFormation = this.createShipFormation(this.encounter.playerShips, 'player')
        area.appendChild(playerFormation)
        
        // Enemy fleet on the right
        const enemyFormation = this.createShipFormation(this.encounter.enemyShips, 'enemy')
        area.appendChild(enemyFormation)
        
        return area
    }

    /**
     * Creates a ship formation (column of ships)
     * @param {Ship[]} ships
     * @param {'player'|'enemy'} side
     * @returns {HTMLElement}
     */
    createShipFormation(ships, side) {
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
            const shipElement = this.createShipElement(ship, side)
            formation.appendChild(shipElement)
        })
        
        return formation
    }

    /**
     * Creates a ship element for the combat map
     * @param {Ship} ship
     * @param {'player'|'enemy'} side
     * @returns {HTMLElement}
     */
    createShipElement(ship, side) {
        const isPlayer = side === 'player'
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
 * @param {Encounter} encounter
 */
function showEncounterVisual(encounter) {
    // Remove any existing encounter visual
    const existing = document.getElementById('encounter-visual-container')
    if (existing) existing.remove()
    
    // Create simplified canvas map
    const container = ce({
        id: 'encounter-visual-container',
        style: {
            width: '100%',
            height: '100vh',
            backgroundColor: '#000',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '0', // Behind modals (modals are typically z-index 1000+)
            overflow: 'hidden',
            pointerEvents: 'none' // Don't block modal interactions
        }
    })
    
    // Create starfield canvas (static background)
    const starfieldCvs = new CanvasWrapper(1, 1, 1, 0, false, false)
    starfieldCvs.canvas.id = 'encounter-starfield'
    starfieldCvs.canvas.style.position = 'absolute'
    starfieldCvs.canvas.style.top = '0'
    starfieldCvs.canvas.style.left = '0'
    starfieldCvs.canvas.style.width = '100%'
    starfieldCvs.canvas.style.height = '100%'
    starfieldCvs.canvas.style.zIndex = '0'
    starfieldCvs.canvas.width = window.innerWidth
    starfieldCvs.canvas.height = window.innerHeight
    
    // Generate and render stars once
    const radius = Math.max(window.innerWidth, window.innerHeight)
    const numStars = COMBAT_MAP_CONFIG.starfieldStarCount
    const backgroundStars = generateBackgroundStars(radius, numStars)
    backgroundStars.forEach((star) => {
        const x = Math.random() * starfieldCvs.canvas.width
        const y = Math.random() * starfieldCvs.canvas.height
        const size = Math.random() * 2 + 0.5
        starfieldCvs.addPixel(0, 0, star.color, size, x, y, true)
    })
    starfieldCvs.redraw(true)
    container.appendChild(starfieldCvs.canvas)
    
    // Create ships canvas (animated foreground)
    const cvs = new CanvasWrapper(1, 1, 1, 0, false, false)
    cvs.root.style.position = 'absolute'
    cvs.root.style.top = '0'
    cvs.root.style.left = '0'
    cvs.root.style.width = '100%'
    cvs.root.style.height = '100%'
    container.appendChild(cvs.root)
    
    document.body.appendChild(container)
    
    // Render ships after DOM is ready
    requestAnimationFrame(() => {
        cvs.autoResize()
        cvs.cameraX = 0
        cvs.cameraY = 0
        cvs.zoom = 60
        
        // Animation state
        const shipJitterOffsets = new Map()
        let enemyShipsOpacity = 0
        let enemyShipsFadedIn = false
        let enemyShipsFadeStartTime = Date.now()
        
        const renderEncounterShips = () => {
            // Clear only ship objects, not pixels (starfield is on separate canvas anyway)
            cvs.clear()
            
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
            
            // Draw player ships
            if (encounter.playerShips) {
                encounter.playerShips.forEach((ship, index) => {
                    const jitter = updateJitter(ship)
                    const shipY = (index - (encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
                    const shipX = leftOffset + jitter.x
                    
                    const shipColor = gs.fleet && gs.fleet.color ? gs.fleet.color : [0, 255, 0, 255]
                    cvs.addFilledCircle(`player-${index}`, shipX, shipY, 20, 5, shipColor)
                })
            }
            
            // Draw enemy ships with fade-in
            if (encounter.enemyShips && encounter.enemyShips.length > 0) {
                if (!enemyShipsFadedIn) {
                    const elapsed = Date.now() - enemyShipsFadeStartTime
                    enemyShipsOpacity = Math.min(1, elapsed / 2000) // 2 second fade
                    if (enemyShipsOpacity >= 1) enemyShipsFadedIn = true
                }
                
                encounter.enemyShips.forEach((ship, index) => {
                    const jitter = updateJitter(ship)
                    const shipY = (index - (encounter.enemyShips.length - 1) / 2) * shipSpacing + jitter.y
                    const shipX = rightOffset + jitter.x
                    
                    const shipColor = [255, 0, 0, Math.floor(255 * enemyShipsOpacity)]
                    cvs.addFilledCircle(`enemy-${index}`, shipX, shipY, 20, 5, shipColor)
                })
            }
            
            cvs.redraw(true)
            
            // Continue animation continuously
            requestAnimationFrame(renderEncounterShips)
        }
        
        renderEncounterShips()
    })
}
