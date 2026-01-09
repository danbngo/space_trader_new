// Combat/Route state tracking
let selectedPlayerShip = null
let selectedEnemyShip = null
let combatLog = []
let currentEncounter = null
let isPlayerTurn = true
let routeAnimationFrame = null
let routeProgress = 0
let shipJitterOffsets = new Map() // Store jitter offsets for each ship

/**
 * Shows the combat/route map with ship formations
 * If encounter has enemies, shows combat. Otherwise shows route travel.
 * @param {Encounter} encounter - The active encounter
 */
function showCombatMap(encounter) {
    console.log('showCombatMap', encounter)
    
    // Initialize state
    currentEncounter = encounter
    const hasEnemies = encounter.enemyShips && encounter.enemyShips.length > 0
    
    if (hasEnemies) {
        // Combat mode
        selectedPlayerShip = getAliveShips(encounter.playerShips)[0] || null
        selectedEnemyShip = getAliveShips(encounter.enemyShips)[0] || null
        combatLog = []
        isPlayerTurn = true
        showCombatMode(encounter)
    } else {
        // Route travel mode
        routeProgress = 0
        shipJitterOffsets.clear()
        showRouteTravelMode(encounter)
    }
}

/**
 * Shows combat mode with action buttons
 * @param {Encounter} encounter
 */
function showCombatMode(encounter) {
/**
 * Shows combat mode with action buttons
 * @param {Encounter} encounter
 */
function showCombatMode(encounter) {
    const container = ce({
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
    const starfield = createStarfield()
    container.appendChild(starfield)
    
    // Create combat area with ships
    const combatArea = createCombatArea(encounter)
    container.appendChild(combatArea)
    
    // Create UI panel at bottom
    const uiPanel = createCombatUIPanel(encounter)
    container.appendChild(uiPanel)
    
    showElement(container)
}

/**
 * Shows route travel mode with animated ships and progress bar
 * @param {Encounter} encounter
 */
function showRouteTravelMode(encounter) {
    const container = ce({
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
    const starfield = createStarfield()
    container.appendChild(starfield)
    
    // Create canvas for ships and thrusters
    const cvs = new CanvasWrapper()
    cvs.canvas.id = 'route-canvas'
    cvs.canvas.style.position = 'absolute'
    cvs.canvas.style.top = '0'
    cvs.canvas.style.left = '0'
    cvs.canvas.style.width = '100%'
    cvs.canvas.style.height = '75%'
    cvs.canvas.style.zIndex = '1'
    cvs.canvas.width = window.innerWidth
    cvs.canvas.height = window.innerHeight * 0.75
    container.appendChild(cvs.canvas)
    
    // Create route UI panel at bottom
    const routePanel = createRouteTravelUIPanel(encounter, cvs)
    container.appendChild(routePanel)
    
    showElement(container)
    
    // Start animation loop
    animateRouteTravel(encounter, cvs)
}

/**
 * Animates ships during route travel
 * @param {Encounter} encounter
 * @param {CanvasWrapper} cvs
 */
function animateRouteTravel(encounter, cvs) {
    const centerX = cvs.canvas.width / 2
    const centerY = cvs.canvas.height / 2
    const shipSpacing = 60
    
    function animate() {
        // Clear canvas objects
        cvs.clearObjects()
        cvs.pixels = [] // Keep background stars
        
        // Update progress (chance of encounter per frame)
        const encounterChancePerFrame = PLANET_ENCOUNTER_CHANCE_PER_DAY / 60 / 60 // Convert from per day to per frame (assuming 60fps)
        if (Math.random() < encounterChancePerFrame) {
            routeProgress += 0.5 // Small increment when encounter chance triggers
        }
        routeProgress = Math.min(routeProgress, 100)
        
        // Update progress bar if it exists
        const progressBarEl = document.getElementById('route-progress-bar')
        if (progressBarEl) {
            const progressFill = progressBarEl.querySelector('.progress-bar-fill')
            if (progressFill) {
                progressFill.style.width = `${routeProgress}%`
            }
        }
        
        // Draw each ship with jitter and thruster
        encounter.playerShips.forEach((ship, index) => {
            if (isShipDestroyed(ship)) return
            
            // Get or create jitter offset for this ship
            if (!shipJitterOffsets.has(ship)) {
                shipJitterOffsets.set(ship, {x: 0, y: 0, targetX: 0, targetY: 0})
            }
            const jitter = shipJitterOffsets.get(ship)
            
            // Update jitter target occasionally (every ~30 frames)
            if (Math.random() < 0.03) {
                jitter.targetX = (Math.random() - 0.5) * 10 // ±5 pixels x
                jitter.targetY = (Math.random() - 0.5) * 30 // ±15 pixels y (more y jitter)
            }
            
            // Smooth movement toward target
            jitter.x += (jitter.targetX - jitter.x) * 0.1
            jitter.y += (jitter.targetY - jitter.y) * 0.1
            
            // Calculate ship position
            const shipY = centerY + (index - (encounter.playerShips.length - 1) / 2) * shipSpacing + jitter.y
            const shipX = centerX + jitter.x
            
            // Draw thruster behind ship (triangle pointing backward)
            const thrusterSize = 15
            const thrusterFlicker = 0.7 + Math.random() * 0.3 // Flicker effect
            const thrusterColor = [255, Math.floor(100 * thrusterFlicker), 0, Math.floor(255 * thrusterFlicker)]
            cvs.addFilledTriangle(
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
            cvs.addFilledCircle(
                `ship-${index}`,
                shipX,
                shipY,
                20,
                5,
                shipColor
            )
            
            // Add ship label
            cvs.addText(
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
        
        cvs.redraw(true)
        
        // Check if we should trigger an encounter
        if (routeProgress >= 100) {
            // Stop animation and trigger encounter
            if (routeAnimationFrame) {
                cancelAnimationFrame(routeAnimationFrame)
                routeAnimationFrame = null
            }
            
            // Trigger next encounter
            console.log('Route progress complete - triggering encounter')
            if (currentEncounter) {
                currentEncounter.endEncounter()
            }
            return
        }
        
        // Continue animation
        routeAnimationFrame = requestAnimationFrame(animate)
    }
    
    animate()
}

/**
 * Creates a starfield background using CanvasWrapper
 * @returns {HTMLElement}
 */
function createStarfield() {
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
 * @param {Encounter} encounter
 * @returns {HTMLElement}
 */
function createCombatArea(encounter) {
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
    const playerFormation = createShipFormation(encounter.playerShips, 'player')
    area.appendChild(playerFormation)
    
    // Enemy fleet on the right
    const enemyFormation = createShipFormation(encounter.enemyShips, 'enemy')
    area.appendChild(enemyFormation)
    
    return area
}

/**
 * Creates a ship formation (column of ships)
 * @param {Ship[]} ships
 * @param {'player'|'enemy'} side
 * @returns {HTMLElement}
 */
function createShipFormation(ships, side) {
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
        const shipElement = createShipElement(ship, side)
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
function createShipElement(ship, side) {
    const isPlayer = side === 'player'
    const isDestroyed = isShipDestroyed(ship)
    const isSelected = (isPlayer && ship === selectedPlayerShip) || (!isPlayer && ship === selectedEnemyShip)
    
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
                selectedPlayerShip = ship
            } else {
                selectedEnemyShip = ship
            }
            refreshCombatMap()
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
 * @param {Encounter} encounter
 * @returns {HTMLElement}
 */
function createCombatUIPanel(encounter) {
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
    updateShipInfo(shipInfo)
    leftPanel.appendChild(shipInfo)
    
    // Action buttons
    const actionButtons = createActionButtons(encounter)
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
 * @param {Encounter} encounter
 * @param {CanvasWrapper} cvs
 * @returns {HTMLElement}
 */
function createRouteTravelUIPanel(encounter, cvs) {
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
    
    // Progress bar container
    const progressBarContainer = ce({
        id: 'route-progress-bar',
        style: {
            width: '60%',
            height: '30px',
            backgroundColor: '#222',
            border: '2px solid #666',
            borderRadius: '5px',
            position: 'relative',
            overflow: 'hidden'
        }
    })
    
    // Progress bar fill
    const progressBarFill = ce({
        classList: ['progress-bar-fill'],
        style: {
            width: '0%',
            height: '100%',
            backgroundColor: '#4CAF50',
            transition: 'width 0.3s ease',
            position: 'relative'
        }
    })
    
    progressBarContainer.appendChild(progressBarFill)
    panel.appendChild(progressBarContainer)
    
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
        if (routeAnimationFrame) {
            cancelAnimationFrame(routeAnimationFrame)
            routeAnimationFrame = null
        }
        
        // End encounter and return to star map
        if (currentEncounter) {
            currentEncounter.endEncounter()
        }
    })
    
    panel.appendChild(cancelButton)
    
    return panel
}

/**
 * Updates the ship info display
 * @param {HTMLElement} infoElement
 */
function updateShipInfo(infoElement) {
    if (!selectedPlayerShip || !selectedEnemyShip) {
        infoElement.innerHTML = 'Select ships to begin combat'
        return
    }
    
    infoElement.innerHTML = `
        <div style="margin-bottom: 5px;">
            <strong style="color: #00ff00;">Your Ship:</strong> ${selectedPlayerShip.shipType.name}
        </div>
        <div style="margin-bottom: 10px; font-size: 12px;">
            Hull: ${selectedPlayerShip.hull[0]}/${selectedPlayerShip.hull[1]} | 
            Shields: ${selectedPlayerShip.shields[0]}/${selectedPlayerShip.shields[1]} | 
            Lasers: ${selectedPlayerShip.lasers[0]}/${selectedPlayerShip.lasers[1]} | 
            Engine: ${selectedPlayerShip.engine}
            ${selectedPlayerShip.evading ? ' | <span style="color: #ffff00;">EVADING</span>' : ''}
        </div>
        <div style="margin-bottom: 5px;">
            <strong style="color: #ff0000;">Target:</strong> ${selectedEnemyShip.shipType.name}
        </div>
        <div style="font-size: 12px;">
            Hull: ${selectedEnemyShip.hull[0]}/${selectedEnemyShip.hull[1]} | 
            Shields: ${selectedEnemyShip.shields[0]}/${selectedEnemyShip.shields[1]}
            ${selectedEnemyShip.evading ? ' | <span style="color: #ffff00;">EVADING</span>' : ''}
        </div>
    `
}

/**
 * Creates action buttons based on available move types
 * @param {Encounter} encounter
 * @returns {HTMLElement}
 */
function createActionButtons(encounter) {
    const buttonContainer = ce({
        style: {
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
        }
    })
    
    if (!selectedPlayerShip || isShipDestroyed(selectedPlayerShip)) {
        buttonContainer.appendChild(ce({
            innerHTML: 'No active ship',
            style: { color: '#fff' }
        }))
        return buttonContainer
    }
    
    // Laser button
    const laserButton = createCombatButton('Laser', () => handleLaserAttack(), selectedPlayerShip.lasers[0] <= 0)
    buttonContainer.appendChild(laserButton)
    
    // Ram button
    const ramButton = createCombatButton('Ram', () => handleRam())
    buttonContainer.appendChild(ramButton)
    
    // Evade button
    const evadeButton = createCombatButton('Evade', () => handleEvade())
    buttonContainer.appendChild(evadeButton)
    
    // Recharge button
    const rechargeButton = createCombatButton('Recharge', () => handleRecharge())
    buttonContainer.appendChild(rechargeButton)
    
    // Flee button
    const fleeButton = createCombatButton('Flee', () => handleFlee())
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
function createCombatButton(label, onClick, disabled = false) {
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
function handleLaserAttack() {
    if (!selectedPlayerShip || !selectedEnemyShip) {
        addToCombatLog('Select a target first!')
        return
    }
    
    if (isShipDestroyed(selectedEnemyShip)) {
        addToCombatLog('Target is already destroyed!')
        return
    }
    
    const result = executeLaserAttack(selectedPlayerShip, selectedEnemyShip)
    addToCombatLog(result.message)
    
    if (result.hit) {
        endPlayerTurn()
    }
}

/**
 * Handles ram action
 */
function handleRam() {
    if (!selectedPlayerShip || !selectedEnemyShip) {
        addToCombatLog('Select a target first!')
        return
    }
    
    if (isShipDestroyed(selectedEnemyShip)) {
        addToCombatLog('Target is already destroyed!')
        return
    }
    
    const result = executeRam(selectedPlayerShip, selectedEnemyShip)
    addToCombatLog(result.message)
    
    endPlayerTurn()
}

/**
 * Handles evade action
 */
function handleEvade() {
    if (!selectedPlayerShip) return
    
    const result = executeEvade(selectedPlayerShip)
    addToCombatLog(result.message)
    
    endPlayerTurn()
}

/**
 * Handles recharge action
 */
function handleRecharge() {
    if (!selectedPlayerShip) return
    
    const shieldResult = rechargeShields(selectedPlayerShip)
    const laserResult = rechargeLasers(selectedPlayerShip)
    
    if (shieldResult.amount > 0) {
        addToCombatLog(shieldResult.message)
    }
    if (laserResult.amount > 0) {
        addToCombatLog(laserResult.message)
    }
    if (shieldResult.amount === 0 && laserResult.amount === 0) {
        addToCombatLog(`${selectedPlayerShip.name} is already fully charged.`)
    }
    
    endPlayerTurn()
}

/**
 * Handles flee action
 */
function handleFlee() {
    if (!selectedPlayerShip) return
    
    // Check if any enemy is about to ram (simplified - assume no ramming for now)
    const enemyRamming = false
    
    const result = executeFlee(selectedPlayerShip, enemyRamming)
    addToCombatLog(result.message)
    
    if (result.escaped) {
        // Check if all player ships have escaped or been destroyed
        checkForCombatEnd()
    } else {
        endPlayerTurn()
    }
}

/**
 * Ends the player's turn and starts enemy turn
 */
function endPlayerTurn() {
    // Reset turn status for player ship
    resetTurnStatus(selectedPlayerShip)
    
    // Check if combat should end
    const combatEnd = checkForCombatEnd()
    if (combatEnd) return
    
    // Switch to enemy turn
    isPlayerTurn = false
    
    // Execute enemy AI turn after a brief delay
    setTimeout(() => {
        executeEnemyTurn()
    }, 1000)
}

/**
 * Executes enemy AI turn
 */
function executeEnemyTurn() {
    const aliveEnemies = getAliveShips(currentEncounter.enemyShips)
    const alivePlayers = getAliveShips(currentEncounter.playerShips)
    
    if (aliveEnemies.length === 0 || alivePlayers.length === 0) {
        checkForCombatEnd()
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
                addToCombatLog(`${enemyShip.name} recharges systems.`)
            }
        } else {
            // Attack with lasers or ram
            const useLasers = enemyShip.lasers[0] > 0 && Math.random() > 0.3
            
            if (useLasers) {
                const result = executeLaserAttack(enemyShip, target)
                addToCombatLog(result.message)
            } else {
                const result = executeRam(enemyShip, target)
                addToCombatLog(result.message)
            }
        }
        
        resetTurnStatus(enemyShip)
    })
    
    // Check for combat end
    const combatEnd = checkForCombatEnd()
    if (combatEnd) return
    
    // Return to player turn
    isPlayerTurn = true
    addToCombatLog('--- Your Turn ---')
    
    // Refresh the display
    refreshCombatMap()
}

/**
 * Checks if combat should end and handles end state
 * @returns {boolean} True if combat ended
 */
function checkForCombatEnd() {
    const result = checkCombatEnd(currentEncounter.playerShips, currentEncounter.enemyShips)
    
    if (result.ended) {
        let message = ''
        if (result.winner === 'player') {
            message = 'Victory! All enemy ships have been destroyed or fled.'
        } else if (result.winner === 'enemy') {
            message = 'Defeat! All your ships have been destroyed or fled.'
        } else {
            message = 'Draw! All ships have been destroyed.'
        }
        
        addToCombatLog(message)
        
        // Show end modal after a delay
        setTimeout(() => {
            showModal('Combat Ended', message, [
                ['Continue', () => {
                    if (currentEncounter) {
                        currentEncounter.endEncounter()
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
function addToCombatLog(message) {
    combatLog.push(message)
    
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
function refreshCombatMap() {
    if (!currentEncounter) return
    
    // Cleanup any ongoing animation
    if (routeAnimationFrame) {
        cancelAnimationFrame(routeAnimationFrame)
        routeAnimationFrame = null
    }
    
    showCombatMap(currentEncounter)
}
