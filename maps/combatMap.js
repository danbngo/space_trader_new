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
        this.combatLog = []
        this.isPlayerTurn = true
        this.routeAnimationFrame = null
        this.routeProgress = 0
        this.shipJitterOffsets = new Map()
        this.routeProgressBar = null
        this.routeCvs = null // Canvas for route travel animation
        
        // Determine mode
        this.hasEnemies = encounter.enemyShips && encounter.enemyShips.length > 0
        
        if (this.hasEnemies) {
            // Combat mode
            this.selectedPlayerShip = this.getAliveShips(encounter.playerShips)[0] || null
            this.selectedEnemyShip = this.getAliveShips(encounter.enemyShips)[0] || null
            this.initializeCombatMode()
        } else {
            // Route travel mode
            this.initializeRouteTravelMode()
        }
    }
    
    /**
     * Initialize DOM for combat mode
     */
    initializeCombatMode() {
        // Create main container
        this.root = ce({
            id: 'combat-map-container',
            style: {
                width: '100%',
                height: '100vh',
                backgroundColor: '#000',
                position: 'relative',
                overflow: 'hidden'
            }
        })
        
        // Create starfield background
        this.createStarfield()
        
        // Create combat area with ships
        this.combatArea = this.createCombatArea()
        this.root.appendChild(this.combatArea)
        
        // Create UI panel at bottom
        this.uiPanel = this.createCombatUIPanel()
        this.root.appendChild(this.uiPanel)
        
        showElement(this.root)
    }
    
    /**
     * Initialize DOM for route travel mode
     */
    initializeRouteTravelMode() {
        // Create main container
        this.root = ce({
            id: 'combat-map-container',
            style: {
                width: '100%',
                height: '100vh',
                backgroundColor: '#000',
                position: 'relative',
                overflow: 'hidden'
            }
        })
        
        // Create starfield background
        this.createStarfield()
        
        // Create canvas for ships and thrusters
        this.routeCvs = new CanvasWrapper()
        this.routeCvs.canvas.id = 'route-canvas'
        this.routeCvs.canvas.style.position = 'absolute'
        this.routeCvs.canvas.style.top = '0'
        this.routeCvs.canvas.style.left = '0'
        this.routeCvs.canvas.style.width = '100%'
        this.routeCvs.canvas.style.height = '75%'
        this.routeCvs.canvas.style.zIndex = '1'
        this.routeCvs.canvas.width = window.innerWidth
        this.routeCvs.canvas.height = window.innerHeight * 0.75
        this.root.appendChild(this.routeCvs.canvas)
        
        // Create route UI panel at bottom
        this.routePanel = this.createRouteTravelUIPanel()
        this.root.appendChild(this.routePanel)
        
        showElement(this.root)
        
        // Start animation loop
        this.animateRouteTravel()
    }
    
    /**
     * Animates ships during route travel
     */
    animateRouteTravel() {
        const centerX = this.routeCvs.canvas.width / 2
        const centerY = this.routeCvs.canvas.height / 2
        const shipSpacing = 60
        
        const animate = () => {
            // Clear canvas objects
            this.routeCvs.clearObjects()
            this.routeCvs.pixels = [] // Keep background stars
            
            // Update progress (chance of encounter per frame)
            const encounterChancePerFrame = PLANET_ENCOUNTER_CHANCE_PER_DAY / 60 / 60 // Convert from per day to per frame (assuming 60fps)
            if (Math.random() < encounterChancePerFrame) {
                this.routeProgress += 0.5 // Small increment when encounter chance triggers
            }
            this.routeProgress = Math.min(this.routeProgress, 100)
            
            // Update progress bar if it exists
            if (this.routeProgressBar) {
                this.routeProgressBar.update(this.routeProgress)
            }
            
            // Draw each ship with jitter and thruster
            this.encounter.playerShips.forEach((ship, index) => {
                if (this.isShipDestroyed(ship)) return
                
                // Get or create jitter offset for this ship
                if (!this.shipJitterOffsets.has(ship)) {
                    this.shipJitterOffsets.set(ship, {x: 0, y: 0, targetX: 0, targetY: 0})
                }
                const jitter = this.shipJitterOffsets.get(ship)
                
                // Update jitter target occasionally (every ~30 frames)
                if (Math.random() < 0.03) {
                    jitter.targetX = (Math.random() - 0.5) * 10 // ±5 pixels x
                    jitter.targetY = (Math.random() - 0.5) * 30 // ±15 pixels y (more y jitter)
                }
                
                // Smooth movement toward target
                jitter.x += (jitter.targetX - jitter.x) * 0.1
                jitter.y += (jitter.targetY - jitter.y) * 0.1
                
                // Calculate ship position
                const shipY = centerY + (index - (this.encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
                const shipX = centerX + jitter.x
                
                // Draw thruster behind ship (triangle pointing backward)
                const thrusterSize = 15
                const thrusterFlicker = 0.7 + Math.random() * 0.3 // Flicker effect
                const thrusterColor = [255, Math.floor(100 * thrusterFlicker), 0, Math.floor(255 * thrusterFlicker)]
                this.routeCvs.addFilledTriangle(
                    `thruster-${index}`,
                    shipX - 25, // Behind the ship
                    shipY,
                    thrusterSize,
                    0,
                    2,
                    thrusterColor,
                    null,
                    Math.PI // Point backward
                )
                
                // Draw ship as filled circle (simplified)
                const shipColor = gs.fleet && gs.fleet.color ? gs.fleet.color : [0, 255, 0, 255]
                this.routeCvs.addFilledCircle(
                    `ship-${index}`,
                    shipX,
                    shipY,
                    20,
                    5,
                    shipColor
                )
                
                // Add ship label
                this.routeCvs.addText(
                    `ship-label-${index}`,
                    shipX,
                    shipY + 30,
                    0,
                    0,
                    ship.shipType.name,
                    [255, 255, 255, 255],
                    12
                )
            })
            
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
     * Creates a starfield background using CanvasWrapper
     * @returns {HTMLElement}
     */
    createStarfield() {
    // Create canvas wrapper for starfield
    const cvs = new CanvasWrapper()
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
    
    // Generate random background stars
    const numStars = 300
    const width = cvs.canvas.width
    const height = cvs.canvas.height
    
    for (let i = 0; i < numStars; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 2 + 0.5 // Size between 0.5 and 2.5
        
        // Create star color with brightness variance
        const baseBrightness = Math.floor(Math.random() * 128 + 127) // 127-255
        const colorVariance = Math.floor(Math.random() * 20)
        const r = Math.min(255, baseBrightness + colorVariance)
        const g = Math.min(255, baseBrightness + colorVariance)
        const b = Math.min(255, baseBrightness + colorVariance)
        const color = [r, g, b, 255]
        
        // Add pixel with parallax = true (static screen position)
        cvs.addPixel(0, 0, color, size, x, y, true)
    }
    
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
                alignItems: 'center'
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
                innerHTML: `Lasers: ${ship.lasers[0]}/${ship.lasers[1]}`,
                style: {
                    color: ship.lasers[0] > 0 ? '#ffff66' : '#888',
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
     * Creates the UI panel at the bottom with action buttons
     * @returns {HTMLElement}
     */
    createCombatUIPanel() {
        const panel = ce({
            id: 'combat-ui-panel',
            style: {
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                height: '30%',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderTop: '2px solid #444',
                padding: '20px',
                display: 'flex',
                flexDirection: 'row',
                gap: '20px',
                zIndex: '2'
            }
        })
        
        // Left side: Ship info and actions
        const leftPanel = ce({
            style: {
                flex: '2',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }
        })
        
        // Ship info section
        const shipInfo = ce({
            id: 'combat-ship-info',
            style: {
                color: '#fff',
                fontSize: '14px'
            }
        })
        this.updateShipInfo(shipInfo)
        leftPanel.appendChild(shipInfo)
        
        // Action buttons
        const actionButtons = this.createActionButtons()
        leftPanel.appendChild(actionButtons)
        
        panel.appendChild(leftPanel)
        
        // Right side: Combat log
        const combatLogPanel = ce({
            id: 'combat-log',
            style: {
                flex: '1',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid #666',
                borderRadius: '5px',
                padding: '10px',
                color: '#fff',
                fontSize: '12px',
                overflowY: 'auto',
                maxHeight: '100%'
            },
            children: [
                ce({
                    innerHTML: '=== Combat Log ===',
                    style: {
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        color: '#ffff00'
                    }
                })
            ]
        })
        panel.appendChild(combatLogPanel)
        
        return panel
    }

    /**
     * Creates the route travel UI panel with progress bar
     * @returns {HTMLElement}
     */
    createRouteTravelUIPanel() {
        const panel = ce({
            id: 'route-ui-panel',
            style: {
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                height: '25%',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderTop: '2px solid #444',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                zIndex: '2',
                alignItems: 'center',
                justifyContent: 'center'
            }
        })
        
        // Progress info
        const progressInfo = ce({
            style: {
                color: '#fff',
                fontSize: '16px',
                marginBottom: '10px'
            },
            children: [
                'Traveling to destination...'
            ]
        })
        panel.appendChild(progressInfo)
        
        // Create progress bar using ProgressBar class
        this.routeProgressBar = new ProgressBar({
            value: 0,
            width: 60,
            fillColor: '#4CAF50',
            backgroundColor: '#222',
            borderColor: '#666',
            overrideLabel: ''
        })
        panel.appendChild(this.routeProgressBar.container)
        
        // Progress text
        const progressText = ce({
            style: {
                color: '#aaa',
                fontSize: '12px',
                marginTop: '10px'
            },
            children: [
                'Progress until next encounter check'
            ]
        })
        panel.appendChild(progressText)
        
        // Cancel button
        const cancelButton = ce({
            tag: 'button',
            innerHTML: 'Cancel Travel',
            style: {
                padding: '10px 20px',
                backgroundColor: '#660000',
                color: '#fff',
                border: '2px solid #aa0000',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                marginTop: '10px'
            }
        })
        
        cancelButton.addEventListener('click', () => {
            // Stop animation
            if (this.routeAnimationFrame) {
                cancelAnimationFrame(this.routeAnimationFrame)
                this.routeAnimationFrame = null
            }
            
            // End encounter and return to star map
            if (this.encounter) {
                this.encounter.endEncounter()
            }
        })
        
        panel.appendChild(cancelButton)
        
        return panel
    }

    /**
     * Updates the ship info display
     * @param {HTMLElement} infoElement
     */
    updateShipInfo(infoElement) {
        if (!this.selectedPlayerShip || !this.selectedEnemyShip) {
            infoElement.innerHTML = 'Select ships to begin combat'
            return
        }
        
        infoElement.innerHTML = `
            <div style="margin-bottom: 5px;">
                <strong style="color: #00ff00;">Your Ship:</strong> ${this.selectedPlayerShip.shipType.name}
            </div>
            <div style="margin-bottom: 10px; font-size: 12px;">
                Hull: ${this.selectedPlayerShip.hull[0]}/${this.selectedPlayerShip.hull[1]} | 
                Shields: ${this.selectedPlayerShip.shields[0]}/${this.selectedPlayerShip.shields[1]} | 
                Lasers: ${this.selectedPlayerShip.lasers[0]}/${this.selectedPlayerShip.lasers[1]} | 
                Engine: ${this.selectedPlayerShip.engine}
                ${this.selectedPlayerShip.evading ? ' | <span style="color: #ffff00;">EVADING</span>' : ''}
            </div>
            <div style="margin-bottom: 5px;">
                <strong style="color: #ff0000;">Target:</strong> ${this.selectedEnemyShip.shipType.name}
            </div>
            <div style="font-size: 12px;">
                Hull: ${this.selectedEnemyShip.hull[0]}/${this.selectedEnemyShip.hull[1]} | 
                Shields: ${this.selectedEnemyShip.shields[0]}/${this.selectedEnemyShip.shields[1]}
                ${this.selectedEnemyShip.evading ? ' | <span style="color: #ffff00;">EVADING</span>' : ''}
            </div>
        `
    }

    /**
     * Creates action buttons based on available move types
     * @returns {HTMLElement}
     */
    createActionButtons() {
        const buttonContainer = ce({
            style: {
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
            }
        })
        
        if (!this.selectedPlayerShip || this.isShipDestroyed(this.selectedPlayerShip)) {
            buttonContainer.appendChild(ce({
                innerHTML: 'No active ship',
                style: { color: '#fff' }
            }))
            return buttonContainer
        }
        
        // Laser button
        const laserButton = this.createCombatButton('Laser', () => this.handleLaserAttack(), this.selectedPlayerShip.lasers[0] <= 0)
        buttonContainer.appendChild(laserButton)
        
        // Ram button
        const ramButton = this.createCombatButton('Ram', () => this.handleRam())
        buttonContainer.appendChild(ramButton)
        
        // Evade button
        const evadeButton = this.createCombatButton('Evade', () => this.handleEvade())
        buttonContainer.appendChild(evadeButton)
        
        // Recharge button
        const rechargeButton = this.createCombatButton('Recharge', () => this.handleRecharge())
        buttonContainer.appendChild(rechargeButton)
        
        // Flee button
        const fleeButton = this.createCombatButton('Flee', () => this.handleFlee())
        buttonContainer.appendChild(fleeButton)
        
        return buttonContainer
    }

    /**
     * Creates a single combat action button
     * @param {string} label
     * @param {Function} onClick
     * @param {boolean} disabled
     * @returns {HTMLElement}
     */
    createCombatButton(label, onClick, disabled = false) {
        const button = ce({
            tag: 'button',
            innerHTML: label,
            classNames: ['combat-action-button'],
            style: {
                padding: '10px 20px',
                backgroundColor: disabled ? '#222' : '#333',
                color: disabled ? '#666' : '#fff',
                border: '2px solid ' + (disabled ? '#444' : '#666'),
                borderRadius: '5px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s'
            }
        })
        
        if (!disabled) {
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = '#555'
                button.style.borderColor = '#888'
            })
            
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = '#333'
                button.style.borderColor = '#666'
            })
            
            button.addEventListener('click', (e)=>onClick())
        }
        
        return button
    }

    /**
     * Handles laser attack action
     */
    handleLaserAttack() {
        if (!this.selectedPlayerShip || !this.selectedEnemyShip) {
            this.addToCombatLog('Select a target first!')
            return
        }
        
        if (this.isShipDestroyed(this.selectedEnemyShip)) {
            this.addToCombatLog('Target is already destroyed!')
            return
        }
        
        const result = executeLaserAttack(this.selectedPlayerShip, this.selectedEnemyShip)
        this.addToCombatLog(result.message)
        
        if (result.hit) {
            this.endPlayerTurn()
        }
    }

    /**
     * Handles ram action
     */
    handleRam() {
        if (!this.selectedPlayerShip || !this.selectedEnemyShip) {
            this.addToCombatLog('Select a target first!')
            return
        }
        
        if (this.isShipDestroyed(this.selectedEnemyShip)) {
            this.addToCombatLog('Target is already destroyed!')
            return
        }
        
        const result = executeRam(this.selectedPlayerShip, this.selectedEnemyShip)
        this.addToCombatLog(result.message)
        
        this.endPlayerTurn()
    }

    /**
     * Handles evade action
     */
    handleEvade() {
        if (!this.selectedPlayerShip) return
        
        const result = executeEvade(this.selectedPlayerShip)
        this.addToCombatLog(result.message)
        
        this.endPlayerTurn()
    }

    /**
     * Handles recharge action
     */
    handleRecharge() {
        if (!this.selectedPlayerShip) return
        
        const shieldResult = rechargeShields(this.selectedPlayerShip)
        const laserResult = rechargeLasers(this.selectedPlayerShip)
        
        if (shieldResult.amount > 0) {
            this.addToCombatLog(shieldResult.message)
        }
        if (laserResult.amount > 0) {
            this.addToCombatLog(laserResult.message)
        }
        if (shieldResult.amount === 0 && laserResult.amount === 0) {
            this.addToCombatLog(`${this.selectedPlayerShip.name} is already fully charged.`)
        }
        
        this.endPlayerTurn()
    }

    /**
     * Handles flee action
     */
    handleFlee() {
        if (!this.selectedPlayerShip) return
        
        // Check if any enemy is about to ram (simplified - assume no ramming for now)
        const enemyRamming = false
        
        const result = executeFlee(this.selectedPlayerShip, enemyRamming)
        this.addToCombatLog(result.message)
        
        if (result.escaped) {
            // Check if all player ships have escaped or been destroyed
            this.checkForCombatEnd()
        } else {
            this.endPlayerTurn()
        }
    }

    /**
     * Ends the player's turn and starts enemy turn
     */
    endPlayerTurn() {
        // Reset turn status for player ship
        resetTurnStatus(this.selectedPlayerShip)
        
        // Check if combat should end
        const combatEnd = this.checkForCombatEnd()
        if (combatEnd) return
        
        // Switch to enemy turn
        this.isPlayerTurn = false
        
        // Execute enemy AI turn after a brief delay
        setTimeout(() => {
            this.executeEnemyTurn()
        }, 1000)
    }

    /**
     * Executes enemy AI turn
     */
    executeEnemyTurn() {
        const aliveEnemies = this.getAliveShips(this.encounter.enemyShips)
        const alivePlayers = this.getAliveShips(this.encounter.playerShips)
        
        if (aliveEnemies.length === 0 || alivePlayers.length === 0) {
            this.checkForCombatEnd()
            return
        }
        
        // Simple AI: each enemy ship attacks
        aliveEnemies.forEach(enemyShip => {
            // Pick a random player target
            const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)]
            
            // Decide on action (simplified AI)
            const needsRecharge = enemyShip.shields[0] < enemyShip.shields[1] * 0.3 || enemyShip.lasers[0] <= 0
            
            if (needsRecharge) {
                // Recharge if low
                const shieldResult = rechargeShields(enemyShip)
                const laserResult = rechargeLasers(enemyShip)
                if (shieldResult.amount > 0 || laserResult.amount > 0) {
                    this.addToCombatLog(`${enemyShip.name} recharges systems.`)
                }
            } else {
                // Attack with lasers or ram
                const useLasers = enemyShip.lasers[0] > 0 && Math.random() > 0.3
                
                if (useLasers) {
                    const result = executeLaserAttack(enemyShip, target)
                    this.addToCombatLog(result.message)
                } else {
                    const result = executeRam(enemyShip, target)
                    this.addToCombatLog(result.message)
                }
            }
            
            resetTurnStatus(enemyShip)
        })
        
        // Check for combat end
        const combatEnd = this.checkForCombatEnd()
        if (combatEnd) return
        
        // Return to player turn
        this.isPlayerTurn = true
        this.addToCombatLog('--- Your Turn ---')
        
        // Refresh the display
        this.refreshCombatMap()
    }

    /**
     * Checks if combat should end and handles end state
     * @returns {boolean} True if combat ended
     */
    checkForCombatEnd() {
        const result = checkCombatEnd(this.encounter.playerShips, this.encounter.enemyShips)
        
        if (result.ended) {
            let message = ''
            if (result.winner === 'player') {
                message = 'Victory! All enemy ships have been destroyed or fled.'
            } else if (result.winner === 'enemy') {
                message = 'Defeat! All your ships have been destroyed or fled.'
            } else {
                message = 'Draw! All ships have been destroyed.'
            }
            
            this.addToCombatLog(message)
            
            // Show end modal after a delay
            setTimeout(() => {
                showModal('Combat Ended', message, [
                    ['Continue', () => {
                        if (this.encounter) {
                            this.encounter.endEncounter()
                        }
                    }]
                ])
            }, 1500)
            
            return true
        }
        
        return false
    }

    /**
     * Adds a message to the combat log
     * @param {string} message
     */
    addToCombatLog(message) {
        this.combatLog.push(message)
        
        const logElement = document.getElementById('combat-log')
        if (logElement) {
            const messageElement = ce({
                innerHTML: message,
                style: {
                    marginBottom: '5px',
                    paddingBottom: '5px',
                    borderBottom: '1px solid #333'
                }
            })
            logElement.appendChild(messageElement)
            
            // Auto-scroll to bottom
            logElement.scrollTop = logElement.scrollHeight
        }
    }

    /**
     * Refreshes the combat map display
     */
    refreshCombatMap() {
        if (!this.encounter) return
        
        // Cleanup any ongoing animation
        this.cleanup()
        
        showCombatMap(this.encounter)
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

    /**
     * Gets all alive ships from an array
     * @param {Ship[]} ships
     * @returns {Ship[]}
     */
    getAliveShips(ships) {
        return ships.filter(ship => !this.isShipDestroyed(ship))
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
