/**
 * Handles travel-specific functionality for TravelMap
 */
class TravelMapCombatHandler {
    /**
     * @param {TravelMap} travelMap - Reference to parent TravelMap instance
     */
    constructor(travelMap) {
        this.travelMap = travelMap
    }

    /**
     * Creates the UI panel at the bottom with action buttons
     * @returns {HTMLElement}
     */
    createCombatUIPanel() {
        const panel = ce({id: 'travel-ui-panel', classNames: ['panel']})
        
        // Left side: Ship info and actions
        const leftPanel = ce({
            children: [
                ce({id: 'travel-ship-info'})
            ]
        })
        
        // Update ship info
        const shipInfo = leftPanel.querySelector('#travel-ship-info')
        this.updateShipInfo(shipInfo)
        
        // Action buttons
        leftPanel.appendChild(this.createActionButtons())
        
        panel.appendChild(leftPanel)
        
        // Right side: Combat log
        panel.appendChild(ce({
            id: 'travel-log',
            children: [
                ce({
                    innerHTML: '=== Combat Log ===',
                    classNames: ['travel-log-header']
                })
            ]
        }))
        
        return panel
    }

    /**
     * Updates the ship info display
     * @param {HTMLElement|Element} infoElement
     */
    updateShipInfo(infoElement) {
        const {selectedPlayerShip, selectedEnemyShip} = this.travelMap
        
        if (!selectedPlayerShip || !selectedEnemyShip) {
            infoElement.innerHTML = 'Select ships to begin combat'
            return
        }
        
        // Clear existing content
        infoElement.innerHTML = ''
        
        // Your Ship info
        infoElement.appendChild(ce({
            classNames: ['ship-info-title'],
            children: [
                ce({tag: 'strong', classNames: ['ship-info-player'], innerHTML: 'Your Ship:'}),
                ce({innerHTML: ` ${selectedPlayerShip.shipType.name}`})
            ]
        }))
        
        infoElement.appendChild(ce({
            classNames: ['ship-info-stats'],
            innerHTML: `Hull: ${selectedPlayerShip.hull[0]}/${selectedPlayerShip.hull[1]} | 
                Shields: ${selectedPlayerShip.shields[0]}/${selectedPlayerShip.shields[1]} | 
                Lasers: ${selectedPlayerShip.lasers} | 
                Engine: ${selectedPlayerShip.engine}
                ${selectedPlayerShip.evading ? ' | <span class="ship-info-evading">EVADING</span>' : ''}`
        }))
        
        // Target info
        infoElement.appendChild(ce({
            classNames: ['ship-info-title'],
            children: [
                ce({tag: 'strong', classNames: ['ship-info-enemy'], innerHTML: 'Target:'}),
                ce({innerHTML: ` ${selectedEnemyShip.shipType.name}`})
            ]
        }))
        
        infoElement.appendChild(ce({
            classNames: ['ship-info-stats'],
            innerHTML: `Hull: ${selectedEnemyShip.hull[0]}/${selectedEnemyShip.hull[1]} | 
                Shields: ${selectedEnemyShip.shields[0]}/${selectedEnemyShip.shields[1]}
                ${selectedEnemyShip.evading ? ' | <span class="ship-info-evading">EVADING</span>' : ''}`
        }))
    }

    /**
     * Creates action buttons based on available move types
     * @returns {HTMLElement}
     */
    createActionButtons() {
        const {selectedPlayerShip, targetingMode} = this.travelMap
        
        const buttonContainer = ce({classNames: ['travel-action-buttons']})
        
        // If in targeting mode, show targeting UI with cancel button
        if (targetingMode) {
            const targetingLabel = targetingMode === 'laser' ? 'Targeting Laser' : 'Targeting Ram'
            buttonContainer.appendChild(ce({
                innerHTML: `<strong>${targetingLabel}</strong> - Select an enemy ship`,
                classNames: ['targeting-mode-label']
            }))
            buttonContainer.appendChild(this.createCombatButton('Cancel', () => this.handleCancelTargeting()))
            return buttonContainer
        }
        
        if (!selectedPlayerShip || selectedPlayerShip.disabled) {
            buttonContainer.appendChild(ce({
                innerHTML: 'No active ship',
                classNames: ['travel-action-button-inactive']
            }))
            return buttonContainer
        }
        
        // Check if ship has actions remaining
        const noActionsLeft = selectedPlayerShip.actionsRemaining <= 0
        
        // Check if shields are full for recharge button
        const shieldsFull = selectedPlayerShip.shields[0] >= selectedPlayerShip.shields[1]
        
        // Create all action buttons
        buttonContainer.appendChild(this.createCombatButton('Laser', () => this.handleLaserAttack(), selectedPlayerShip.lasers <= 0 || noActionsLeft))
        buttonContainer.appendChild(this.createCombatButton('Ram', () => this.handleRam(), noActionsLeft))
        buttonContainer.appendChild(this.createCombatButton('Recharge', () => this.handleRecharge(), shieldsFull || noActionsLeft))
        buttonContainer.appendChild(this.createCombatButton('Flee', () => this.handleFlee(), noActionsLeft))
        
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
            disabled: disabled
        })
        
        if (!disabled) {
            button.addEventListener('click', (e)=>onClick())
        }
        
        return button
    }

    /**
     * Handles laser attack action
     */
    handleLaserAttack() {
        const {selectedPlayerShip} = this.travelMap
        
        if (!selectedPlayerShip) {
            gs.combat.addToCombatLog('Select your ship first!')
            this.refreshCombatLog()
            return
        }
        
        // Enter targeting mode
        this.travelMap.targetingMode = 'laser'
        this.travelMap.setupTargetingMode()
        this.travelMap.updateUIPanel() // Refresh to show targeting UI
    }

    /**
     * Handles ram action
     */
    handleRam() {
        const {selectedPlayerShip} = this.travelMap
        
        if (!selectedPlayerShip) {
            gs.combat.addToCombatLog('Select your ship first!')
            this.refreshCombatLog()
            return
        }
        
        // Enter targeting mode
        this.travelMap.targetingMode = 'ram'
        this.travelMap.setupTargetingMode()
        this.travelMap.updateUIPanel() // Refresh to show targeting UI
    }

    /**
     * Handles canceling targeting mode
     */
    handleCancelTargeting() {
        this.travelMap.targetingMode = null
        gs.combat.addToCombatLog('Targeting cancelled')
        this.refreshCombatLog()
        this.travelMap.updateUIPanel() // Refresh to show normal UI
    }

    /**
     * Handles recharge action
     */
    handleRecharge() {
        const {selectedPlayerShip} = this.travelMap
        if (!selectedPlayerShip) return
        
        const result = gs.combat.executeAction(selectedPlayerShip, 'recharge')
        selectedPlayerShip.actionsRemaining--
        this.refreshCombatLog()
        
        this.handleActionComplete()
    }

    /**
     * Handles flee action
     */
    handleFlee() {
        const {selectedPlayerShip} = this.travelMap
        if (!selectedPlayerShip) return
        
        const result = gs.combat.executeAction(selectedPlayerShip, 'flee')
        selectedPlayerShip.actionsRemaining--
        this.refreshCombatLog()
        
        if (result.escaped) {
            // Update combat result and check if all ships escaped
            gs.combat.updateCombatResult()
            if (gs.combat.result) {
                this.showCombatEndModal()
                return
            }
        }
        
        this.handleActionComplete()
    }

    /**
     * Handles action completion - checks turn completion and switches turns if needed
     */
    handleActionComplete() {
        // Check if combat should end first
        if (gs.combat.result) {
            this.showCombatEndModal()
            return
        }
        
        // Let combat handle turn completion
        gs.combat.handleTurnComplete()
        
        // If it's now enemy turn, execute AI after a brief delay
        if (gs.combat.activeTurnFleet === gs.combat.enemyFleet) {
            setTimeout(() => {
                this.executeEnemyTurn()
            }, 1000)
        } else {
            // Refresh display for player's turn
            this.travelMap.refreshTravelMap()
        }
    }

    /**
     * Executes enemy AI turn
     */
    executeEnemyTurn() {
        const results = gs.combat.executeEnemyTurn()
        this.refreshCombatLog()
        
        // Check if combat ended
        if (gs.combat.result) {
            this.showCombatEndModal()
            return
        }
        
        // Refresh the display for player turn
        this.travelMap.refreshTravelMap()
    }

    /**
     * Shows combat end modal based on encounter result
     */
    showCombatEndModal() {
        if (!gs.combat.result) return
        
        let message = ''
        if (gs.combat.result === ENCOUNTER_RESULTS.Victory) {
            message = 'Victory! All enemy ships have been destroyed or fled.'
        } else if (gs.combat.result === ENCOUNTER_RESULTS.Defeat) {
            message = 'Defeat! All your ships have been destroyed or fled.'
        } else if (gs.combat.result === ENCOUNTER_RESULTS.Escaped) {
            message = 'You have successfully escaped!'
        } else {
            message = 'Combat ended.'
        }
        
        gs.combat.addToCombatLog(message)
        this.refreshCombatLog()
        
        // Show end modal after a delay
        setTimeout(() => {
            showModal('Combat Ended', message, [
                ['Continue', () => {
                    this.travelMap.resetNPCShipsConfig()
                    gs.encounter.endCombat()
                }]
            ])
        }, 1500)
    }

    /**
     * Refreshes the combat log display from encounter's log
     */
    refreshCombatLog() {
        const logElement = document.getElementById('travel-log')
        if (!logElement) {
            return
        }
        
        const messages = gs.combat.log.getAll()
        
        // Clear existing log but keep header
        logElement.innerHTML = ''
        logElement.appendChild(ce({
            innerHTML: '=== Combat Log ===',
            classNames: ['travel-log-header']
        }))
        
        // Display all messages from combat log
        for (const message of messages) {
            logElement.appendChild(ce({
                innerHTML: message,
                classNames: ['travel-log-message']
            }))
        }
        
        // Auto-scroll to bottom
        logElement.scrollTop = logElement.scrollHeight
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
        
        const shipObj = this.travelMap.cvs.getObject(`ship-${ship.uuid}`)
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
        
        const addedObj = this.travelMap.cvs.addObject(textObj)
        console.log('Text object added to canvas, returned object:', addedObj)
        console.log('Canvas object count:', this.travelMap.cvs.objectMap.size)
        console.log('Text in canvas objectMap:', this.travelMap.cvs.objectMap.has(textId))
    }

    /**
     * Displays a laser beam from attacker to target that disappears after a duration
     * @param {Ship} attacker - The ship firing the laser
     * @param {Ship} target - The ship being targeted
     * @param {number[]} color - RGBA color array for the laser
     * @param {number} durationMs - How long the laser should display (default 500ms)
     */
    displayLaserBeam(attacker, target, color = [255, 0, 0, 1], durationMs = 500) {
        const attackerObj = this.travelMap.cvs.getObject(`ship-${attacker.uuid}`)
        const targetObj = this.travelMap.cvs.getObject(`ship-${target.uuid}`)
        
        if (!attackerObj || !targetObj) {
            console.warn('Could not find ship objects for laser beam')
            return
        }
        
        // Calculate front of attacker ship
        // Player ships (left side) face right, enemy ships (right side) face left
        const shipRadius = TRAVEL_MAP_CONFIG.shipSize / 2
        const attackerIsPlayer = gs.fleet.ships.includes(attacker)
        const attackerFrontX = attackerIsPlayer ? 
            attackerObj.x + shipRadius : 
            attackerObj.x - shipRadius
        
        // Laser goes from front of attacker to center of target
        const laserId = `laser-${attacker.uuid}-${Date.now()}`
        const laserObj = new CanvasObject({
            id: laserId,
            shape: SHAPES.Line,
            x: attackerFrontX,
            y: attackerObj.y,
            x2: targetObj.x,
            y2: targetObj.y,
            strokeColor: color,
            lineWidth: 4,
            size: 4,
            durationMs: durationMs
        })
        
        this.travelMap.cvs.addObject(laserObj)
    }

    /**
     * Animates a ramming ship surging forward and back
     * @param {Ship} attacker - The ship doing the ramming
     * @param {Ship} target - The ship being rammed
     * @param {number} durationMs - Total animation duration (default 600ms)
     */
    animateRam(attacker, target, durationMs = 600) {
        const attackerObj = this.travelMap.cvs.getObject(`ship-${attacker.uuid}`)
        const targetObj = this.travelMap.cvs.getObject(`ship-${target.uuid}`)
        
        if (!attackerObj || !targetObj) {
            console.warn('Could not find ship objects for ram animation')
            return
        }
        
        const startX = attackerObj.x
        const targetX = targetObj.x
        const midpointX = (startX + targetX) / 2
        
        // Store original position on the ship object
        attackerObj.ramStartX = startX
        attackerObj.ramMidpointX = midpointX
        
        const ramAnimation = new Loop(
            durationMs,
            (progressRatio) => {
                const shipObj = this.travelMap.cvs.getObject(`ship-${attacker.uuid}`)
                if (!shipObj) return
                
                if (progressRatio <= 0.5) {
                    // First half: surge forward to midpoint
                    const forwardProgress = progressRatio * 2 // 0 to 1
                    shipObj.x = startX + (midpointX - startX) * forwardProgress
                } else {
                    // Second half: return to start
                    const returnProgress = (progressRatio - 0.5) * 2 // 0 to 1
                    shipObj.x = midpointX + (startX - midpointX) * returnProgress
                }
            },
            () => {
                // On complete: ensure ship is back at start position
                const shipObj = this.travelMap.cvs.getObject(`ship-${attacker.uuid}`)
                if (shipObj) {
                    shipObj.x = startX
                }
            }
        )
        
        this.travelMap.animations.push(ramAnimation)
    }

    /**
     * Handles ship click events - both player and enemy ships
     * @param {Ship} ship - The ship that was clicked
     * @param {Object} shipGroupConfig - Configuration object with mirror flag
     */
    onClickShip(ship, shipGroupConfig) {
        console.log('Ship clicked:', ship.shipType.name, 'Fleet:', ship.fleet?.name, 'Mirror:', shipGroupConfig.mirror)
        if (shipGroupConfig.mirror) {
            // Enemy ship clicked
            console.log('Enemy ship clicked, targetingMode:', this.travelMap.targetingMode)
            
            if (this.travelMap.targetingMode) {
                // Player is targeting this enemy ship for an attack
                if (ship.disabled) {
                    gs.combat.addToCombatLog('Target is already destroyed!')
                    this.refreshCombatLog()
                    return
                }
                
                const attackType = this.travelMap.targetingMode
                this.travelMap.targetingMode = null // Clear targeting mode
                
                // Execute the attack
                this.performAttack(attackType, ship)
            } else {
                // Normal selection
                console.log('Setting selectedEnemyShip to:', ship.shipType.name)
                this.travelMap.selectedEnemyShip = ship
                // Update UI panel to reflect selection
                this.travelMap.updateUIPanel()
            }
        } else {
            // Player ship clicked
            // Don't allow selection if ship has no actions remaining
            if (ship.actionsRemaining <= 0) {
                console.log('Ship has no actions remaining:', ship.shipType.name)
                return
            }
            
            console.log('Setting selectedPlayerShip to:', ship.shipType.name)
            this.travelMap.selectedPlayerShip = ship
            
            // Update UI panel to reflect selection
            this.travelMap.updateUIPanel()
        }
    }

    /**
     * Performs an attack on the target ship (laser or ram)
     * @param {string} attackType - Type of attack ('laser' or 'ram')
     * @param {Ship} targetShip - The ship being attacked
     */
    performAttack(attackType, targetShip) {
        const result = gs.combat.executeAction(this.travelMap.selectedPlayerShip, attackType, targetShip)
        this.travelMap.selectedPlayerShip.actionsRemaining--
        
        // Display laser beam if it's a laser attack, or animate ram
        if (attackType === 'laser') {
            this.displayLaserBeam(this.travelMap.selectedPlayerShip, targetShip, [255, 0, 0, 1], 500)
        } else if (attackType === 'ram') {
            this.animateRam(this.travelMap.selectedPlayerShip, targetShip, 600)
        }
        
        console.log('Combat result:', result)
        console.log('Shields absorbed:', result.shieldsAbsorbed, 'Hull damage:', result.hullDamage)
        
        // Display damage text over the target ship
        if (!result.success && attackType !== 'ram') {
            // Attack missed - show "Missed" in dark gray
            this.displayTextOverShip(targetShip, [100, 100, 100, 1], 'Missed', 1500, 0)
        } else {
            if (result.shieldsAbsorbed && result.shieldsAbsorbed > 0) {
                console.log('Displaying shield damage text')
                this.displayTextOverShip(targetShip, [100, 150, 255, 1], `-${result.shieldsAbsorbed}`, 1500, -30)
            }
            if (result.hullDamage && result.hullDamage > 0) {
                console.log('Displaying hull damage text')
                this.displayTextOverShip(targetShip, [255, 255, 255, 1], `-${result.hullDamage}`, 1500, 30)
            }
        }
        
        // Display "Disabled" if ship was destroyed
        if (result.destroyed) {
            this.displayTextOverShip(targetShip, [255, 0, 0, 1], 'Disabled', 2000, 0)
        }
        
        // Display self-damage for ram attacks
        if (attackType === 'ram' && result.selfHullDamage && result.selfHullDamage > 0) {
            this.displayTextOverShip(this.travelMap.selectedPlayerShip, [255, 200, 0, 1], `-${result.selfHullDamage}`, 1500, 0)
        }
        
        if (result.success || attackType === 'ram') {
            this.handleActionComplete()
        } else {
            // Refresh UI even if attack failed
            this.travelMap.updateUIPanel()
        }
    }

}
