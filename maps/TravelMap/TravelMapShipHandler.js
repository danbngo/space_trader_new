/**
 * Handles ship rendering, jitter animations, and visual updates for TravelMap
 */
class TravelMapShipHandler {
    /**
     * @param {TravelMap} travelMap - Reference to parent TravelMap instance
     */
    constructor(travelMap) {
        this.travelMap = travelMap
        this.shipJitterOffsets = new Map()
        
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
    }

    /**
     * Updates jitter offset for a ship (smooth random movement)
     * @param {Ship} ship - The ship to update jitter for
     * @param {number} maxX - Maximum horizontal jitter (±)
     * @param {number} maxY - Maximum vertical jitter (±)
     * @returns {Object} - Current jitter offset {x, y, targetX, targetY}
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
     * Calculates the color to apply to a ship based on fleet color and opacity
     * @param {Ship} ship - The ship to calculate color for
     * @param {ShipGroupConfig} shipGroupConfig - Configuration for opacity
     * @returns {Array} RGBA color array
     */
    calcColorForShip(ship, shipGroupConfig) { 
        const baseShipColor = ship.fleet && ship.fleet.color ? ship.fleet.color : COLORS.White
        const shipColor = [...baseShipColor]
        if (shipColor.length >= 4) {
            shipColor[3] *= shipGroupConfig.opacity
        }
        // Don't make tint completely blot out the image itself (only during creation)
        return shipColor
    }

    /**
     * Applies color modifications to a ship based on state (selected, targeting, disabled, etc.)
     * @param {Ship} ship - The ship to modify colors for
     * @param {CanvasObject} shipObj - The ship's canvas object
     * @param {ShipGroupConfig} shipGroupConfig - Configuration for opacity and group settings
     */
    applyShipColorModifications(ship, shipObj, shipGroupConfig) {
        const isPlayerShip = gs.fleet.ships.includes(ship)
        const shipColor = this.calcColorForShip(ship, shipGroupConfig)
        //apply opacity during fadein / fadeout
        shipObj.fillColor = shipColor
        shipObj.fillColor[3] = shipGroupConfig.opacity
        if (ship.disabled) {
            shipObj.darkenRatio = 1; //darkest ships are disabled ones
        }
        shipObj.darkenRatio = 0 //default = no darken
        if (this.travelMap.selectedPlayerShip === ship) {
            shipObj.darkenRatio = -0.5 //lighten selected player ship
        }
        else if (this.travelMap.targetingMode) {
            if (isPlayerShip) {
                shipObj.darkenRatio = 0.5 //darken other player ships while targeting
            }
            else if (this.travelMap.combatHandler.targetedShips.has(ship)) {
                shipObj.darkenRatio = -0.5 //lighten enemy ships that are valid targets
            }
            else {
                shipObj.darkenRatio = 0.5 //darken invalid targets
            }
        }
        else {
            if (ship.actionsRemaining <= 0) {
                shipObj.darkenRatio = 0.5 //darken ships with no moves remaining
            }
        }
    }


    /**
     * Applies click handlers to a ship canvas object based on ship type and state
     * @param {CanvasObject} shipObj - The ship's canvas object
     * @param {Ship} ship - The ship entity
     * @param {ShipGroupConfig} shipGroupConfig - Configuration for this ship's group
     */
    applyShipClickFunctions(shipObj, ship, shipGroupConfig) {
        const onClick = () => {
            this.travelMap.combatHandler.onClickShip(ship, shipGroupConfig)
        }
        
        if (shipGroupConfig.mirror) {
            // Enemy ships: only clickable during targeting mode
            if (this.travelMap.targetingMode) {
                if (!shipObj.onClick) {
                    shipObj.onClick = onClick
                }
            } else {
                // Not in targeting mode - disable enemy ship clicks
                shipObj.onClick = null
                shipObj.onHover = null
                shipObj.onHoverEnd = null
            }
        } else {
            // Player ships: handle based on actionsRemaining
            if (ship.actionsRemaining <= 0 || this.travelMap.targetingMode) {
                // Disable interactions for ships with no actions or during targeting
                shipObj.onClick = null
                shipObj.onHover = null
                shipObj.onHoverEnd = null
            } else if (!shipObj.onClick) {
                // Re-enable interactions if they were disabled
                shipObj.onClick = onClick
            }
        }
    }

    /**
     * Renders a ship with its shape and label (creates if doesn't exist, then updates position)
     * @param {Ship} ship - The ship to render
     * @param {number} x - Target x position (base position, jitter will be applied)
     * @param {number} y - Target y position (base position, jitter will be applied)
     * @param {ShipGroupConfig} shipGroupConfig - Configuration for this ship's group
     */
    renderShip(ship, x, y, shipGroupConfig) {
        const shipSize = TRAVEL_MAP_CONFIG.shipSize
        //const labelOffsetY = TRAVEL_MAP_CONFIG.labelOffsetY
        
        // Apply jitter to position
        const jitter = this.updateShipJitter(ship)
        const jitteredX = x + jitter.x
        const jitteredY = y + jitter.y
        
        // Check if ship already exists
        let shipObj = this.travelMap.cvs.getObject(`ship-${ship.uuid}`)
        
        // Create ship if it doesn't exist
        if (!shipObj) {
            const shipColor = this.calcColorForShip(ship, shipGroupConfig)
            
            if (ship.shipType.shipShape && ship.shipType.shipShape.addCanvasObject) {
                shipObj = ship.shipType.shipShape.addCanvasObject(`ship-${ship.uuid}`, this.travelMap.cvs, shipColor, shipSize, shipGroupConfig.mirror)
                // Set smaller hit radius for more precise clicking
                shipObj.hitRadius = TRAVEL_MAP_CONFIG.shipHitRadius
            } else {
                throw new Error('ship must have a shipshape')
            }
            
            // Create thruster
            const rotation = shipGroupConfig.mirror ? 0 : Math.PI
            this.travelMap.cvs.addFilledTriangle(
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

        // Update ship position and interactions
        if (shipObj) {
            shipObj.x = jitteredX
            shipObj.y = jitteredY
            
            // Update onClick handler based on ship type and state
            this.applyShipClickFunctions(shipObj, ship, shipGroupConfig)
            this.applyShipColorModifications(ship, shipObj, shipGroupConfig)
        }
        
        // Update thruster position, size, and color with flicker effect
        this.updateThruster(ship, jitteredX, jitteredY, shipSize, shipGroupConfig)
        
        // Update progress bars (only show during encounters)
        if (shipObj && gs.encounter) {
            this.addShipProgressBars(ship, shipObj, shipGroupConfig)
        }
    }

    /**
     * Updates thruster visual effects with flicker animation
     * @param {Ship} ship - The ship this thruster belongs to
     * @param {number} x - Ship x position
     * @param {number} y - Ship y position
     * @param {number} shipSize - Size of the ship
     * @param {ShipGroupConfig} shipGroupConfig - Configuration for opacity
     */
    updateThruster(ship, x, y, shipSize, shipGroupConfig) {
        const thrusterObj = this.travelMap.cvs.getObject(`thruster-${ship.uuid}`)
        if (thrusterObj) {
            // Calculate flicker
            const flickerRange = TRAVEL_MAP_CONFIG.thrusterFlickerMax - TRAVEL_MAP_CONFIG.thrusterFlickerMin
            const thrusterFlicker = TRAVEL_MAP_CONFIG.thrusterFlickerMin + Math.random() * flickerRange
            
            // Update size with flicker
            const thrusterSize = shipSize / 2 * TRAVEL_MAP_CONFIG.thrusterSizeMultiplier * thrusterFlicker
            thrusterObj.size = thrusterSize / 2
            thrusterObj.minorSize = thrusterSize
            
            // Update color with flicker
            const thrusterColor = [255, Math.floor(150 * thrusterFlicker), 0, shipGroupConfig.opacity * thrusterFlicker]
            thrusterObj.fillColor = thrusterColor
            
            // Update position
            const thrusterOffset = shipGroupConfig.mirror ? shipSize / 2 : -shipSize / 2
            thrusterObj.x = x + thrusterOffset
            thrusterObj.y = y
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
        
        // Bar background (black) - note: fillColor already has opacity applied from caller
        const bgId = `${barType}-bg-${ship.uuid}`
        let bg = this.travelMap.cvs.getObject(bgId)
        if (!bg) {
            const bgColor = [...COLORS.Black]
            // Apply same opacity as fillColor to background
            //if (bgColor.length >= 4 && fillColor.length >= 4) {
            //    bgColor[3] = fillColor[3]
            //}
            bg = this.travelMap.cvs.addLine(
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
        let fg = this.travelMap.cvs.getObject(fgId)
        if (!fg) {
            fg = this.travelMap.cvs.addLine(
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
        const barY = y - TRAVEL_MAP_CONFIG.shipSize / 2 + TRAVEL_MAP_CONFIG.shipBarYOffset
        const hullBarY = barY
        const shieldBarY = barY - TRAVEL_MAP_CONFIG.shipBarHeight - TRAVEL_MAP_CONFIG.shipBarSpacing
        
        // Calculate fill ratios
        const hullPercent = ship.hull[0] / ship.hull[1]
        const shieldPercent = ship.shields[0] / ship.shields[1]
        
        // Render hull bar with opacity applied
        const baseHullColor = hullPercent < 0.3 ? COLORS.Red : COLORS.Orange
        const hullColor = [...baseHullColor]
        //if (hullColor.length >= 4) {
        //    hullColor[3] = shipGroupConfig.opacity
        //}
        this.addShipStatBar(ship, shipObj, 'hull', hullColor, hullPercent, hullBarY)
        
        // Render shield bar with opacity applied
        const shieldColor = [...COLORS.Blue]
        //if (shieldColor.length >= 4) {
        //    shieldColor[3] = shipGroupConfig.opacity
        //}
        this.addShipStatBar(ship, shipObj, 'shield', shieldColor, shieldPercent, shieldBarY)
    }

    /**
     * Renders a group of ships with fade-in and fade-out animation
     * @param {Ship[]} ships - Array of ships to render
     * @param {ShipGroupConfig} config - Configuration object for this ship group
     */
    renderShipGroup(ships, config) {
        //const shipSpacing = TRAVEL_MAP_CONFIG.shipSpacing
        
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
                
                if (config.opacity >= 1) {
                    config.fadedIn = true
                }
            }
        }
        
        // Render each ship
        ships.forEach((ship, index) => {
            if (ship.disabled) return
            
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
            
            const shipX = config.xOffset + xDepthOffset
            // shipY already set above
            
            // Render ship (handles both creation and position updates, including jitter)
            this.renderShip(ship, shipX, shipY, config)
        })
    }

    /**
     * Renders ships with thrusters and jitter
     * Creates ship objects once, then updates their positions on subsequent calls
     */
    renderShips() {
        // Update offsets based on current canvas size
        this.playerShipGroupConfig.xOffset = -(this.travelMap.cvs.canvas.width / this.travelMap.cvs.zoom) * Math.abs(TRAVEL_MAP_CONFIG.playerShipsOffset)
        this.enemyShipGroupConfig.xOffset = (this.travelMap.cvs.canvas.width / this.travelMap.cvs.zoom) * TRAVEL_MAP_CONFIG.enemyShipsOffset
        
        // Render player ships
        this.renderShipGroup(gs.fleet.ships, this.playerShipGroupConfig)
        
        // Render enemy ships if they exist OR if they are fading out
        if (this.enemyShipGroupConfig.fadingOut) {
            console.log('Rendering fade-out ships, count:', this.enemyShipGroupConfig.fadeOutShips?.length)
            // Continue rendering stored ships during fade-out
            this.renderShipGroup(this.enemyShipGroupConfig.fadeOutShips || [], this.enemyShipGroupConfig)
        } else if (gs.encounter && gs.encounter.fleet && gs.encounter.fleet.ships && gs.encounter.fleet.ships.length > 0) {
            this.renderShipGroup(gs.encounter.fleet.ships, this.enemyShipGroupConfig)
        } else {
            // No encounter and not fading out - clean up any remaining ship objects
            this.cleanupRemovedShips()
        }
        
        this.travelMap.cvs.redraw(true)
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
        this.travelMap.cvs.drawOrder.forEach(obj => {
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
            this.travelMap.cvs.deleteObject(id)
        })
        
        if (objectsToRemove.length > 0) {
            console.log('Cleaned up', objectsToRemove.length, 'canvas objects for removed ships')
        }
    }

    /**
     * Resets NPC ship configuration when encounter changes
     */
    resetNPCShipsConfig() {
        console.log('🔄 Encounter changed, updating TravelMap')
        
        // Reset fade states for new encounter
        this.enemyShipGroupConfig.fadedIn = false
        this.enemyShipGroupConfig.opacity = 0
        this.enemyShipGroupConfig.fadeStartTime = 0
        
        // Update selected ships if in combat
        if (gs.combat) {
            this.travelMap.selectedPlayerShip = gs.combat.activePlayerShips?.[0] || null
            this.travelMap.selectedEnemyShip = gs.combat.activeEnemyShips?.[0] || null
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
}
