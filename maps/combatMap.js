// Combat state tracking
let selectedPlayerShip = null
let selectedEnemyShip = null
let combatLog = []
let currentEncounter = null
let isPlayerTurn = true

/**
 * Shows the combat map with side-by-side ship formations
 * Player ships on the left, enemy ships on the right
 * @param {Encounter} encounter - The active encounter
 */
function showCombatMap(encounter) {
    console.log('showCombatMap', encounter)
    
    // Initialize combat state
    currentEncounter = encounter
    selectedPlayerShip = getAliveShips(encounter.playerShips)[0] || null
    selectedEnemyShip = getAliveShips(encounter.enemyShips)[0] || null
    combatLog = []
    isPlayerTurn = true
    
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
        className: `ship-formation ${side}-formation`,
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
    
    const shipEl = ce({
        className: `combat-ship ${side}-ship ${isSelected ? 'selected' : ''}`,
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
        className: 'combat-action-button',
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
        
        button.addEventListener('click', onClick)
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
    showCombatMap(currentEncounter)
}
