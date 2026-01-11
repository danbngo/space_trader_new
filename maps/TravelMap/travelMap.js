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
        this.selectedEnemyShip = null
        this.routeAnimationFrame = null
        this.routeProgress = 0
        this.shipJitterOffsets = new Map()
        this.routeProgressBar = null
        this.targetingMode = null // 'laser', 'ram', or null
        this.shipOriginalColors = new Map() // Store original colors for dimming/restoring
        
        /** @type {ShipGroupConfig} */
        this.playerShipGroupConfig = {
            fadedIn: false,
            opacity: 0,
            fadeStartTime: 0,
            xOffset: 0,
            mirror: false,
            onFadeOutComplete: null,
            fadeOutShips: null,
            fadingOut: null,
        }
        
        /** @type {ShipGroupConfig} */
        this.enemyShipGroupConfig = {
            fadedIn: false,
            opacity: 0,
            fadeStartTime: 0,
            xOffset: 0,
            mirror: true,
            fadingOut: false,
            onFadeOutComplete: null,
            fadeOutShips: null
        }
        
        // Route travel UI element references (set by route handler)
        this.routeDistanceEl = null
        this.routeETAEl = null
        
        // Track UI state to detect changes
        this.previousUIState = null
        
        // Initialize handlers
        this.combatHandler = new TravelMapCombatHandler(this)
        this.routeHandler = new TravelMapRouteHandler(this)
        
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
        
        // Create UI panel at bottom (will be updated dynamically)
        this.updateUIPanel()
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
            
            // Update UI panel if state changed
            const currentUIState = gs.encounter ? (gs.encounter.combatEnabled ? 'combat' : 'encounter') : 'travel'
            if (currentUIState !== this.previousUIState) {
                console.log('UI state changed from', this.previousUIState, 'to', currentUIState)
                this.previousUIState = currentUIState
                this.updateUIPanel()
            }
            
            // Render ships (always to allow fade-in and smooth animation)
            this.renderShips()
            
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
     * Triggers fade-out animation for enemy ships
     * @param {Function} onComplete - Callback to execute when fade-out completes
     */
    fadeOutEnemyShips(onComplete) {
        // Store current enemy ships before they're removed
        if (gs.encounter && gs.encounter.fleet && gs.encounter.fleet.ships) {
            console.log('fadeOutEnemyShips: Storing', gs.encounter.fleet.ships.length, 'ships for fade-out')
            this.enemyShipGroupConfig.fadeOutShips = [...gs.encounter.fleet.ships]
            this.enemyShipGroupConfig.fadingOut = true
            this.enemyShipGroupConfig.fadeStartTime = Date.now()
            this.enemyShipGroupConfig.onFadeOutComplete = () => {
                console.log('Fade-out complete, cleaning up')
                // Clean up after fade-out
                this.cleanupRemovedShips()
                if (onComplete) onComplete()
            }
            console.log('Starting enemy ship fade-out animation, opacity:', this.enemyShipGroupConfig.opacity)
        } else {
            console.log('fadeOutEnemyShips: No ships to fade out')
            if (onComplete) {
                // No ships to fade out, call completion immediately
                onComplete()
            }
        }
    }
    
    /**
     * Removes canvas objects for ships that no longer exist
     */
    cleanupRemovedShips() {
        // Get current ship UUIDs
        const currentShipUUIDs = new Set()
        
        // Add player ships
        if (gs.fleet && gs.fleet.ships) {
            gs.fleet.ships.forEach(ship => currentShipUUIDs.add(ship.uuid))
        }
        
        // Add enemy ships if encounter exists
        if (gs.encounter && gs.encounter.fleet && gs.encounter.fleet.ships) {
            gs.encounter.fleet.ships.forEach(ship => currentShipUUIDs.add(ship.uuid))
        }
        
        // Find and remove canvas objects for ships that no longer exist
        const objectsToRemove = []
        this.cvs.drawOrder.forEach(obj => {
            if (obj.id) {
                // Check if this is a ship-related object
                const prefixes = ['ship-', 'label-', 'thruster-', 'hull-bg-', 'hull-fg-', 'shield-bg-', 'shield-fg-']
                for (const prefix of prefixes) {
                    if (obj.id.startsWith(prefix)) {
                        const uuid = obj.id.substring(prefix.length)
                        if (!currentShipUUIDs.has(uuid)) {
                            objectsToRemove.push(obj.id)
                        }
                        break
                    }
                }
            }
        })
        
        // Remove the objects
        objectsToRemove.forEach(id => {
            this.cvs.deleteObject(id)
        })
        
        if (objectsToRemove.length > 0) {
            console.log('Cleaned up', objectsToRemove.length, 'canvas objects for removed ships')
        }
    }
    
    /**
     * Updates the UI panel based on current combat state
     */
    updateUIPanel() {
        const inCombat = gs.encounter && gs.encounter.combatEnabled
        let newPanel
        
        if (inCombat) {
            newPanel = this.combatHandler.createCombatUIPanel()
            
            // Replace the panel
            if (this.uiPanel) {
                this.uiPanel.replaceWith(newPanel)
            }
            this.uiPanel = newPanel
            
            // Populate the combat log after creating the panel
            this.combatHandler.refreshCombatLog()
        } else if (gs.encounter) {
            // Hide UI panel during encounters (when modal is shown)
            newPanel = ce({innerHTML: 'test', style: {color: 'red', fontSize: '40px'}})
        } else {
            newPanel = this.routeHandler.createRouteTravelUIPanel()
        }
        
        if (this.uiPanel && !inCombat) {
            this.uiPanel.replaceWith(newPanel)
        }
        this.uiPanel = newPanel
    }
    
    /**
     * Dims all ships except the selected one
     * @param {Ship} selectedShip - The ship to keep at normal brightness
     */
    dimOtherShips(selectedShip) {
        // Get all ships
        const allShips = [...gs.fleet.ships]
        if (gs.encounter && gs.encounter.fleet && gs.encounter.fleet.ships) {
            allShips.push(...gs.encounter.fleet.ships)
        }
        
        allShips.forEach(ship => {
            if (ship === selectedShip) return // Don't dim the selected ship
            
            const shipObj = this.cvs.getObject(`ship-${ship.uuid}`)
            if (shipObj && shipObj.fillColor) {
                // Store original color if not already stored
                if (!this.shipOriginalColors.has(ship.uuid)) {
                    this.shipOriginalColors.set(ship.uuid, [...shipObj.fillColor])
                }
                // Darken the ship (50% brightness)
                shipObj.fillColor = darkenColor(this.shipOriginalColors.get(ship.uuid), 0.5)
            }
        })
    }
    
    /**
     * Restores all ships to their original colors
     */
    restoreShipColors() {
        this.shipOriginalColors.forEach((originalColor, uuid) => {
            const shipObj = this.cvs.getObject(`ship-${uuid}`)
            if (shipObj && shipObj.fillColor) {
                shipObj.fillColor = [...originalColor]
            }
        })
        this.shipOriginalColors.clear()
        
        // After restoring, darken ships with no actions remaining
        this.applyActionBasedDarkening()
    }
    
    /**
     * Applies brightness changes to ships based on their state:
     * - 50% lighter: selected player ship
     * - Normal: player ships with actions remaining, enemy ships (when not targeting)
     * - 50% darker: player ships that already acted
     */
    applyActionBasedDarkening() {
        // Handle player ships
        gs.fleet.ships.forEach(ship => {
            const shipObj = this.cvs.getObject(`ship-${ship.uuid}`)
            if (shipObj && shipObj.fillColor) {
                if (!this.shipOriginalColors.has(ship.uuid)) {
                    this.shipOriginalColors.set(ship.uuid, [...shipObj.fillColor])
                }
                
                if (ship === this.selectedPlayerShip) {
                    // Selected player ship: 50% lighter
                    shipObj.fillColor = lightenColor(this.shipOriginalColors.get(ship.uuid), 0.5)
                } else if (this.selectedPlayerShip) {
                    // When a player ship is selected, all other player ships are 50% darker
                    shipObj.fillColor = darkenColor(this.shipOriginalColors.get(ship.uuid), 0.5)
                } else if (ship.actionsRemaining <= 0) {
                    // Player ship that already acted (when no ship is selected): 50% darker
                    shipObj.fillColor = darkenColor(this.shipOriginalColors.get(ship.uuid), 0.5)
                } else {
                    // Player ship with actions remaining (when no ship is selected): normal brightness
                    shipObj.fillColor = [...this.shipOriginalColors.get(ship.uuid)]
                }
            }
        })
        
        // Handle enemy ships - normal brightness when not in targeting mode
        if (gs.encounter && gs.encounter.fleet && gs.encounter.fleet.ships) {
            gs.encounter.fleet.ships.forEach(ship => {
                const shipObj = this.cvs.getObject(`ship-${ship.uuid}`)
                if (shipObj && shipObj.fillColor) {
                    if (!this.shipOriginalColors.has(ship.uuid)) {
                        this.shipOriginalColors.set(ship.uuid, [...shipObj.fillColor])
                    }
                    // Enemy ships stay at normal brightness unless in targeting mode
                    shipObj.fillColor = [...this.shipOriginalColors.get(ship.uuid)]
                }
            })
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
            if (shipObj && shipObj.fillColor) {
                // Store original color if not already stored
                if (!this.shipOriginalColors.has(ship.uuid)) {
                    this.shipOriginalColors.set(ship.uuid, [...shipObj.fillColor])
                }
                
                // Selected ship: 50% lighter, others: darken if no actions, normal if actions remain
                if (ship === this.selectedPlayerShip) {
                    shipObj.fillColor = lightenColor(this.shipOriginalColors.get(ship.uuid), 0.5)
                } else if (ship.actionsRemaining <= 0) {
                    shipObj.fillColor = darkenColor(this.shipOriginalColors.get(ship.uuid), 0.5)
                } else {
                    shipObj.fillColor = [...this.shipOriginalColors.get(ship.uuid)]
                }
                
                // Disable all player ship interactions during targeting
                shipObj.onClick = null
                shipObj.onHover = null
                shipObj.onHoverEnd = null
            }
        })
        
        // Lighten enemy ships and add hover handlers
        gs.encounter.fleet.ships.forEach(ship => {
            const shipObj = this.cvs.getObject(`ship-${ship.uuid}`)
            if (shipObj && shipObj.fillColor) {
                // Store original color if not already stored
                if (!this.shipOriginalColors.has(ship.uuid)) {
                    this.shipOriginalColors.set(ship.uuid, [...shipObj.fillColor])
                }
                // Lighten enemy ships during targeting (50% lighter)
                shipObj.fillColor = lightenColor(this.shipOriginalColors.get(ship.uuid), 0.5)
                
                // Add hover handlers for even more brightness on hover
                shipObj.onHover = () => {
                    if (this.targetingMode) {
                        // Make it even brighter on hover (75% lighter)
                        shipObj.fillColor = lightenColor(this.shipOriginalColors.get(ship.uuid), 0.75)
                    }
                }
                shipObj.onHoverEnd = () => {
                    if (this.targetingMode) {
                        // Return to 50% lighter
                        shipObj.fillColor = lightenColor(this.shipOriginalColors.get(ship.uuid), 0.5)
                    }
                }
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
     * Renders a ship with its shape and label (creates if doesn't exist, then updates position)
     * @param {Ship} ship - The ship to render
     * @param {number} x - Target x position
     * @param {number} y - Target y position
     * @param {ShipGroupConfig} shipGroupConfig - Configuration for this ship's group
     */
    renderShip(ship, x, y, shipGroupConfig) {
        //console.log('Rendering ship:', ship.shipType.name, 'at', x, y)
        const shipSize = TRAVEL_MAP_CONFIG.shipSize
        const labelOffsetY = TRAVEL_MAP_CONFIG.labelOffsetY
        
        // Check if ship already exists
        let shipObj = this.cvs.getObject(`ship-${ship.uuid}`)
        
        // Create ship if it doesn't exist
        if (!shipObj) {
            const baseShipColor = ship.fleet && ship.fleet.color ? ship.fleet.color : COLORS.White
            const shipColor = [...baseShipColor]
            if (shipColor.length >= 4) {
                shipColor[3] = shipGroupConfig.opacity
            }
            
            // Create onClick handler for ship selection
            const onClick = () => {
                console.log('Ship clicked:', ship.shipType.name, 'Fleet:', ship.fleet?.name, 'Mirror:', shipGroupConfig.mirror)
                if (shipGroupConfig.mirror) {
                    // Enemy ship clicked
                    console.log('Enemy ship clicked, targetingMode:', this.targetingMode)
                    
                    if (this.targetingMode) {
                        // Player is targeting this enemy ship for an attack
                        if (ship.disabled) {
                            gs.combat.addToCombatLog('Target is already destroyed!')
                            this.combatHandler.refreshCombatLog()
                            return
                        }
                        
                        const attackType = this.targetingMode
                        this.targetingMode = null // Clear targeting mode
                        
                        // Restore all ship colors
                        this.restoreShipColors()
                        
                        // Execute the attack
                        const result = gs.combat.executeAction(this.selectedPlayerShip, attackType, ship)
                        this.selectedPlayerShip.actionsRemaining--
                        
                        console.log('Combat result:', result)
                        console.log('Shields absorbed:', result.shieldsAbsorbed, 'Hull damage:', result.hullDamage)
                        
                        // Display damage text over the target ship
                        if (!result.success && attackType !== 'ram') {
                            // Attack missed - show "Missed" in red
                            this.displayTextOverShip(ship, [255, 0, 0, 1], 'Missed', 1500, 0)
                        } else {
                            if (result.shieldsAbsorbed && result.shieldsAbsorbed > 0) {
                                console.log('Displaying shield damage text')
                                this.displayTextOverShip(ship, [100, 150, 255, 1], `-${result.shieldsAbsorbed}`, 1500, -30)
                            }
                            if (result.hullDamage && result.hullDamage > 0) {
                                console.log('Displaying hull damage text')
                                this.displayTextOverShip(ship, [255, 255, 255, 1], `-${result.hullDamage}`, 1500, 30)
                            }
                        }
                        
                        if (result.success || attackType === 'ram') {
                            this.combatHandler.handleActionComplete()
                        } else {
                            // Refresh UI even if attack failed
                            this.updateUIPanel()
                        }
                    } else {
                        // Normal selection
                        console.log('Setting selectedEnemyShip to:', ship.shipType.name)
                        this.selectedEnemyShip = ship
                        // Update UI panel to reflect selection
                        this.updateUIPanel()
                    }
                } else {
                    // Player ship clicked
                    // Don't allow selection if ship has no actions remaining
                    if (ship.actionsRemaining <= 0) {
                        console.log('Ship has no actions remaining:', ship.shipType.name)
                        return
                    }
                    
                    console.log('Setting selectedPlayerShip to:', ship.shipType.name)
                    this.selectedPlayerShip = ship
                    
                    // Dim all other ships
                    this.restoreShipColors() // Clear any existing dimming first
                    this.dimOtherShips(ship)
                    
                    // Update UI panel to reflect selection
                    this.updateUIPanel()
                }
            }
            
            if (ship.shipType.shipShape && ship.shipType.shipShape.addCanvasObject) {
                shipObj = ship.shipType.shipShape.addCanvasObject(`ship-${ship.uuid}`, this.cvs, shipColor, shipSize, shipGroupConfig.mirror)
                // Add onClick handler based on ship type and state
                if (shipGroupConfig.mirror) {
                    // Enemy ships: only clickable during targeting mode
                    if (this.targetingMode) {
                        shipObj.onClick = onClick
                    }
                } else if (ship.actionsRemaining > 0) {
                    // Player ships: only clickable if they have actions
                    shipObj.onClick = onClick
                }
                // Set smaller hit radius for more precise clicking
                shipObj.hitRadius = TRAVEL_MAP_CONFIG.shipHitRadius
                
                // Darken ships with no actions remaining (50% brightness)
                if (ship.actionsRemaining <= 0) {
                    if (!this.shipOriginalColors.has(ship.uuid)) {
                        this.shipOriginalColors.set(ship.uuid, [...shipObj.fillColor])
                    }
                    shipObj.fillColor = darkenColor(shipObj.fillColor, 0.5)
                }
            } else {
                throw new Error('ship must have a shipshape')
            }
            
            // Create ship label (hidden by default)
            // const labelColor = [...COLORS.White]
            // this.cvs.addText(
            //     `label-${ship.uuid}`,
            //     0,
            //     0,
            //     0,
            //     labelOffsetY,
            //     ship.shipType.name,
            //     labelColor,
            //     12
            // )
            
            // Create thruster
            const rotation = shipGroupConfig.mirror ? 0 : Math.PI
            this.cvs.addFilledTriangle(
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

        // Update ship position
        if (shipObj) {
            shipObj.x = x
            shipObj.y = y
            
            // Update color and interactions based on actionsRemaining
            const baseShipColor = ship.fleet && ship.fleet.color ? ship.fleet.color : COLORS.White
            const shipColor = [...baseShipColor]
            if (shipColor.length >= 4) {
                shipColor[3] = shipGroupConfig.opacity
            }
            
            // Apply darkening for ships with no actions (unless already stored/modified)
            if (!this.shipOriginalColors.has(ship.uuid)) {
                if (ship.actionsRemaining <= 0) {
                    this.shipOriginalColors.set(ship.uuid, shipColor)
                    shipObj.fillColor = darkenColor(shipColor, 0.5)
                } else {
                    shipObj.fillColor = shipColor
                }
            }
            
            // Update onClick handler based on ship type and state
            if (shipGroupConfig.mirror) {
                // Enemy ships: only clickable during targeting mode
                if (this.targetingMode) {
                    if (!shipObj.onClick) {
                        shipObj.onClick = () => {
                            if (ship.disabled) {
                                gs.combat.addToCombatLog('Target is already destroyed!')
                                this.combatHandler.refreshCombatLog()
                                return
                            }
                            
                            const attackType = this.targetingMode
                            this.targetingMode = null
                            this.restoreShipColors()
                            
                            const result = gs.combat.executeAction(this.selectedPlayerShip, attackType, ship)
                            this.selectedPlayerShip.actionsRemaining--
                            this.combatHandler.refreshCombatLog()
                            
                            console.log('Combat result:', result)
                            console.log('Result properties:', Object.keys(result))
                            console.log('Shields absorbed:', result.shieldsAbsorbed, 'Hull damage:', result.hullDamage)
                            
                            // Display damage text over the target ship
                            if (!result.success && attackType !== 'ram') {
                                // Attack missed - show "Missed" in red
                                this.displayTextOverShip(ship, [255, 0, 0, 1], 'Missed', 1500, 0)
                            } else {
                                if (result.shieldsAbsorbed && result.shieldsAbsorbed > 0) {
                                    console.log('Displaying shield damage text')
                                    this.displayTextOverShip(ship, [100, 150, 255, 1], `-${result.shieldsAbsorbed}`, 1500, -30)
                                }
                                if (result.hullDamage && result.hullDamage > 0) {
                                    console.log('Displaying hull damage text')
                                    this.displayTextOverShip(ship, [255, 255, 255, 1], `-${result.hullDamage}`, 1500, 30)
                                }
                            }
                            
                            if (result.success || attackType === 'ram') {
                                this.combatHandler.handleActionComplete()
                            } else {
                                this.updateUIPanel()
                            }
                        }
                    }
                } else {
                    // Not in targeting mode - disable enemy ship clicks
                    shipObj.onClick = null
                    shipObj.onHover = null
                    shipObj.onHoverEnd = null
                }
            } else {
                // Player ships: handle based on actionsRemaining
                if (ship.actionsRemaining <= 0 || this.targetingMode) {
                    // Disable interactions for ships with no actions or during targeting
                    shipObj.onClick = null
                    shipObj.onHover = null
                    shipObj.onHoverEnd = null
                } else if (!shipObj.onClick) {
                    // Re-enable interactions if they were disabled
                    shipObj.onClick = () => {
                        if (ship.actionsRemaining <= 0) return
                        console.log('Setting selectedPlayerShip to:', ship.shipType.name)
                        this.selectedPlayerShip = ship
                        this.restoreShipColors()
                        this.dimOtherShips(ship)
                        this.updateUIPanel()
                    }
                }
            }
        }
        
        // Update thruster position, size, and color with flicker effect
        const thrusterObj = this.cvs.getObject(`thruster-${ship.uuid}`)
        if (thrusterObj) {
            // Calculate flicker
            const flickerRange = TRAVEL_MAP_CONFIG.thrusterFlickerMax - TRAVEL_MAP_CONFIG.thrusterFlickerMin
            const thrusterFlicker = TRAVEL_MAP_CONFIG.thrusterFlickerMin + Math.random() * flickerRange
            
            // Update size with flicker
            const thrusterSize = shipSize/2 * TRAVEL_MAP_CONFIG.thrusterSizeMultiplier * thrusterFlicker
            thrusterObj.size = thrusterSize / 2
            thrusterObj.minorSize = thrusterSize
            
            // Update color with flicker
            const thrusterColor = [255, Math.floor(150 * thrusterFlicker), 0, shipGroupConfig.opacity * thrusterFlicker]
            thrusterObj.fillColor = thrusterColor
            
            // Update position
            const thrusterOffset = shipGroupConfig.mirror ? shipSize/2 : -shipSize/2
            thrusterObj.x = x + thrusterOffset
            thrusterObj.y = y
        }
        
        // Update label position (hidden by default)
        // const label = this.cvs.getObject(`label-${ship.uuid}`)
        // if (label) {
        //     label.x = x
        //     label.y = y - shipSize/2
        // }
        
        // Update progress bars (only show during encounters)
        if (shipObj && gs.encounter) {
            this.addShipProgressBars(ship, shipObj, shipGroupConfig)
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
        let bg = this.cvs.getObject(bgId)
        if (!bg) {
            const bgColor = [...COLORS.Black]
            // Apply same opacity as fillColor to background
            if (bgColor.length >= 4 && fillColor.length >= 4) {
                bgColor[3] = fillColor[3]
            }
            bg = this.cvs.addLine(
                bgId,
                x - TRAVEL_MAP_CONFIG.shipBarWidth / 2,
                barY,
                x + TRAVEL_MAP_CONFIG.shipBarWidth / 2,
                barY,
                bgColor,
                TRAVEL_MAP_CONFIG.shipBarHeight
            )
            bg.strokeColor = [255, 255, 255, 255]
            bg.lineWidth = 2
            bg.zIndex = 100
        } else {
            bg.x = x - TRAVEL_MAP_CONFIG.shipBarWidth / 2
            bg.y = barY
            bg.x2 = x + TRAVEL_MAP_CONFIG.shipBarWidth / 2
            bg.y2 = barY
        }
        
        // Bar foreground (colored based on type and health)
        const fgId = `${barType}-fg-${ship.uuid}`
        let fg = this.cvs.getObject(fgId)
        if (!fg) {
            fg = this.cvs.addLine(
                fgId,
                x - TRAVEL_MAP_CONFIG.shipBarWidth / 2,
                barY,
                x - TRAVEL_MAP_CONFIG.shipBarWidth / 2 + TRAVEL_MAP_CONFIG.shipBarWidth * fillRatio,
                barY,
                fillColor,
                TRAVEL_MAP_CONFIG.shipBarHeight - 2
            )
            fg.strokeColor = [255, 255, 255, 255]
            fg.lineWidth = 2
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
     * Renders a group of ships with fade-in and fade-out animation
     * @param {Ship[]} ships - Array of ships to render
     * @param {ShipGroupConfig} config - Configuration object for this ship group
     */
    renderShipGroup(ships, config) {
        //console.log('📋 renderShipGroup called with', ships, 'ships, mirror:', config.mirror)
        const shipSpacing = TRAVEL_MAP_CONFIG.shipSpacing
        
        // Handle fade-out animation
        if (config.fadingOut) {
            const elapsed = Date.now() - config.fadeStartTime
            const fadeTime = TRAVEL_MAP_CONFIG.enemyFadeInDuration
            config.opacity = Math.max(0, 1 - (elapsed / fadeTime))
            console.log('Fading out, elapsed:', elapsed, 'opacity:', config.opacity)
            
            if (config.opacity <= 0) {
                // Fade-out complete
                console.log('Fade-out animation complete')
                config.fadingOut = false
                config.fadeOutShips = null
                if (config.onFadeOutComplete) {
                    config.onFadeOutComplete()
                    config.onFadeOutComplete = null
                }
                return // Don't render ships after fade-out completes
            }
            // Use stored ships during fade-out
            ships = config.fadeOutShips || []
        } else {
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
        }
        
        // Render each ship
        ships.forEach((ship, index) => {
            if (ship.disabled) return
            
            const jitter = this.updateShipJitter(ship)
            
            // Flying V formation positioning
            // ships[0] is lead (center), ships[1,2] are wing pair 1, ships[3,4] are wing pair 2
            const shipSpacingX = TRAVEL_MAP_CONFIG.shipSpacingX
            const shipSpacingY = TRAVEL_MAP_CONFIG.shipSpacingY
            let shipY = 0
            let xDepthOffset = 0 // How far back from lead ship
            
            if (index === 0) {
                // Lead ship - centered
                shipY = 0
                xDepthOffset = 0
            } else {
                // Wing ships - alternate above/below, progressively further back
                const pairIndex = Math.floor((index - 1) / 2) // 0 for ships[1,2], 1 for ships[3,4]
                const isUpper = (index % 2 === 1) // ships[1,3] above, ships[2,4] below
                
                shipY = (isUpper ? -1 : 1) * shipSpacingY * (pairIndex + 1)
                // For mirrored (enemy) ships, flip the depth offset direction
                const depthDirection = config.mirror ? 1 : -1
                xDepthOffset = depthDirection * shipSpacingX * 1.8 * (pairIndex + 1) // Each pair further back
            }
            
            const shipX = config.xOffset + xDepthOffset + jitter.x
            shipY = shipY + jitter.y
            
            // Render ship (handles both creation and position updates)
            this.renderShip(ship, shipX, shipY, config)
            
            // Apply opacity for fade-in or fade-out
            if (!config.fadedIn || config.fadingOut) {
                this.cvs.drawOrder.forEach(obj => {
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
        //console.log('🚢 Rendering ships on travel map')
        
        // Update offsets based on current canvas size
        this.playerShipGroupConfig.xOffset = -(this.cvs.canvas.width / this.cvs.zoom) * Math.abs(TRAVEL_MAP_CONFIG.playerShipsOffset)
        this.enemyShipGroupConfig.xOffset = (this.cvs.canvas.width / this.cvs.zoom) * TRAVEL_MAP_CONFIG.enemyShipsOffset
        
        // Render player ships
        this.renderShipGroup(gs.fleet.ships, this.playerShipGroupConfig)
        
        // Render enemy ships if they exist OR if they are fading out
        if (this.enemyShipGroupConfig.fadingOut) {
            console.log('Rendering fade-out ships, count:', this.enemyShipGroupConfig.fadeOutShips?.length)
            // Continue rendering stored ships during fade-out
            this.renderShipGroup(this.enemyShipGroupConfig.fadeOutShips || [], this.enemyShipGroupConfig)
        } else if (gs.encounter && gs.encounter.fleet && gs.encounter.fleet.ships && gs.encounter.fleet.ships.length > 0) {
            //console.log('🚀 Rendering enemy ships from encounter:', gs.encounter.fleet.ships.length, 'ships', gs.encounter.fleet.ships, gs.encounter)
            this.renderShipGroup(gs.encounter.fleet.ships, this.enemyShipGroupConfig)
        } else {
            // No encounter and not fading out - clean up any remaining ship objects
            this.cleanupRemovedShips()
        }
        
        this.cvs.redraw(true)
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
     * Displays floating text over a ship that disappears after a duration
     * @param {Ship} ship - The ship to display text over
     * @param {number[]} color - RGBA color array for the text
     * @param {string} text - The text to display
     * @param {number} durationMs - How long the text should display (default 1000ms)
     * @param {number} xOffset - Horizontal offset from ship center (default 0)
     */
    displayTextOverShip(ship, color, text, durationMs = 1000, xOffset = 0) {
        console.log('=== displayTextOverShip called ===')
        console.log('Ship:', ship.shipType.name, 'UUID:', ship.uuid)
        console.log('Text:', text, 'Color:', color, 'Duration:', durationMs, 'X Offset:', xOffset)
        
        const shipObj = this.cvs.getObject(`ship-${ship.uuid}`)
        console.log('Ship object found:', shipObj)
        if (!shipObj) {
            console.warn('Could not find ship object for:', ship.shipType.name)
            return
        }
        console.log('Ship position:', shipObj.x, shipObj.y)
        
        const textId = `damage-text-${ship.uuid}-${Date.now()}`
        console.log('Creating text object with ID:', textId)
        
        const textObj = new CanvasObject({
            id: textId,
            shape: SHAPES.Text,
            x: shipObj.x,
            y: shipObj.y,
            screenOffsetX: xOffset,
            screenOffsetY: -TRAVEL_MAP_CONFIG.shipSize / 2 - 30,
            textContent: text,
            fillColor: color,
            size: 24,
            fontModifier: 'bold',
            durationMs: durationMs
        })
        console.log('Text object created:', textObj)
        console.log('Text object properties - visible:', textObj.visible, 'expired:', textObj.expired)
        console.log('Text object position - x:', textObj.x, 'y:', textObj.y, 'offsets:', textObj.screenOffsetX, textObj.screenOffsetY)
        
        const addedObj = this.cvs.addObject(textObj)
        console.log('Text object added to canvas, returned object:', addedObj)
        console.log('Canvas object count:', this.cvs.objectMap.size)
        console.log('Text in canvas objectMap:', this.cvs.objectMap.has(textId))
    }

    /**
     * Refreshes the combat map display
     */
    refreshTravelMap() {
        // Re-render the ships on canvas
        if (this.cvs) {
            this.renderShips()
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

/**
 * Factory function to create and show a combat map
 */
function showTravelMap() {
    const map = new TravelMap()
    showMap(map)
}
