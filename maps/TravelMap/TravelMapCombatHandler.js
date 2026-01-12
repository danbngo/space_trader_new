/**
 * Handles travel-specific functionality for TravelMap
 */
class TravelMapCombatHandler {
    /**
     * @param {TravelMap} travelMap - Reference to parent TravelMap instance
     */
    constructor(travelMap) {
        this.travelMap = travelMap
        
        // Initialize specialized handlers
        this.laserHandler = new TravelMapCombatLaserHandler(this)
        this.ramHandler = new TravelMapCombatRamHandler(this)
        this.rechargeHandler = new TravelMapCombatRechargeHandler(this)
        
        // Targeting state
        this.targetingShip = null
        this.targetedShips = new Set()
        this.targetingMode = null // 'laser', 'ram', or null
    }

    /**
     * Creates the UI panel at the bottom with action buttons
     * @returns {HTMLElement}
     */
    createCombatUIPanel() {
        const panel = ce({id: 'travel-ui-panel', classNames: ['panel', !gs.fleet.ships.includes(this.travelMap.selectedShip) ? 'scanning-mode' : null]})
        
        // Left side: Ship info and actions
        const leftPanel = ce({
            children: [
                ce({id: 'travel-ship-info'})
            ]
        })
        
        // Update ship info
        const shipInfo = leftPanel.querySelector('#travel-ship-info')
        this.updateShipInfo(shipInfo)
        /*if (shipInfo.innerHTML === '') {
            panel.style.display = 'none'
        }*/
        
        // Action buttons
        leftPanel.appendChild(this.createActionButtons())
        
        panel.appendChild(leftPanel)
        
        return panel
    }

    /**
     * Updates the ship info display
     * @param {HTMLElement|Element} infoElement
     */
    updateShipInfo(infoElement) {
        const {selectedShip} = this.travelMap
        console.log('updating ship info:',infoElement, selectedShip)
        if (!selectedShip) {
            infoElement.innerHTML = ''
            return
        }
        
        infoElement.innerHTML = ''
        
        const children = [
            `<u>${coloredName(selectedShip.fleet)} ${selectedShip.shipType.name}</u>`,
            `Hull: ${selectedShip.hull[0]}/${selectedShip.hull[1]} | 
                Shields: ${selectedShip.shields[0]}/${selectedShip.shields[1]}`
        ]
        
        if (selectedShip.hull[0] <= 0) {
            children.push(colorSpan('Disabled', COLORS.Red))
        }
        
        infoElement.appendChild(ce({
            children: children
        }))
    }

    /**
     * Creates action buttons based on available move types
     * @returns {HTMLElement}
     */
    createActionButtons() {
        const {selectedShip} = this.travelMap
        const {targetingMode} = this
        
        const buttonContainer = ce({classNames: ['travel-action-buttons']})
        
        // If in targeting mode, show targeting UI with cancel button
        if (targetingMode) {
            const targetingLabel = targetingMode === 'laser' ? 'Targeting Laser' : 'Targeting Ram'
            buttonContainer.appendChild(ce({
                innerHTML: `<strong>${targetingLabel}</strong> - Select a target`,
                classNames: ['targeting-mode-label']
            }))
            buttonContainer.appendChild(ce({
                tag: 'button',
                innerHTML: 'Cancel',
                onClick: () => this.handleCancelTargeting()
            }))
            return buttonContainer
        }

        if (!gs.fleet.ships.includes(selectedShip)) {
            return buttonContainer
        }
        
        if (!selectedShip || selectedShip.disabled) {
            buttonContainer.appendChild(ce({
                innerHTML: '',
            }))
            return buttonContainer
        }

        // Check if ship has actions remaining
        const noActionsLeft = selectedShip.actionsRemaining <= 0
        if (noActionsLeft) {
            buttonContainer.appendChild(ce({
                innerHTML: '(No actions remaining)',
            }))
            return buttonContainer
        }
        
        // Check if shields are full for recharge button
        const shieldsFull = selectedShip.shields[0] >= selectedShip.shields[1]
        
        // Create all action buttons
        buttonContainer.appendChild(ce({
            tag: 'button',
            innerHTML: 'Laser',
            disabled: selectedShip.lasers <= 0,
            onClick: () => this.laserHandler.handleLaserAttack()
        }))
        buttonContainer.appendChild(ce({
            tag: 'button',
            innerHTML: 'Ram',
            onClick: () => this.ramHandler.handleRam()
        }))
        buttonContainer.appendChild(ce({
            tag: 'button',
            innerHTML: 'Recharge',
            disabled: shieldsFull,
            onClick: () => this.rechargeHandler.handleRecharge()
        }))
        buttonContainer.appendChild(ce({
            tag: 'button',
            innerHTML: 'Flee',
            onClick: () => this.handleFlee()
        }))
        
        return buttonContainer
    }

    /**
     * Handles canceling targeting mode
     */
    handleCancelTargeting() {
        this.targetingMode = null
        this.targetingShip = null
        this.targetedShips.clear()
        this.travelMap.updateUIPanel() // Refresh to show normal UI
    }

    /**
     * Handles recharge action
     */
    handleRecharge() {
        this.rechargeHandler.handleRecharge()
    }

    /**
     * Handles flee action
     */
    handleFlee() {
        const {selectedShip} = this.travelMap
        if (!selectedShip) return
        
        const result = gs.combat.executeAction(selectedShip, 'flee')
        selectedShip.actionsRemaining--
        
        if (result.escaped) {
            // Update combat result and check if all ships escaped
            gs.combat.updateCombatResult()
            if (gs.combat.result) {
                this.showCombatEndModal()
                return
            }
        }
        
        // Deselect ship if it has no actions remaining
        if (selectedShip.actionsRemaining <= 0) {
            this.travelMap.selectedShip = null
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
            this.travelMap.refresh()
        }
    }

    /**
     * Executes enemy AI turn
     */
    executeEnemyTurn() {
        const results = gs.combat.executeEnemyTurn()
        // Check if combat ended
        if (gs.combat.result) {
            this.showCombatEndModal()
            return
        }
        
        // Refresh the display for player turn
        this.travelMap.refresh()
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
     * Displays damage text over a ship based on combat result
     * @param {Ship} ship - The ship to display damage over
     * @param {number} hullDamage - Hull damage dealt (0 if none)
     * @param {number} shieldDamage - Shield damage dealt (0 if none)
     * @param {boolean} destroyed - Whether the ship was destroyed
     * @param {boolean} missed - Whether the attack missed
     */
    displayDamageText(ship, hullDamage = 0, shieldDamage = 0, destroyed = false, missed = false) {
        if (hullDamage == 0 && shieldDamage == 0 && !destroyed && !missed) {
            return
        }
        if (missed) {
            this.displayTextOverShip(ship, TRAVEL_MAP_CONFIG.floatingTextColors.missed, 'Missed', TRAVEL_MAP_CONFIG.floatingTextDuration, 0)
            return
        }
        
        if (shieldDamage > 0) {
            this.displayTextOverShip(ship, TRAVEL_MAP_CONFIG.floatingTextColors.shieldDamage, `-${shieldDamage}`, TRAVEL_MAP_CONFIG.floatingTextDuration, -30)
        }
        if (hullDamage > 0) {
            this.displayTextOverShip(ship, TRAVEL_MAP_CONFIG.floatingTextColors.hullDamage, `-${hullDamage}`, TRAVEL_MAP_CONFIG.floatingTextDuration, 30)
        }
        if (destroyed) {
            this.displayTextOverShip(ship, TRAVEL_MAP_CONFIG.floatingTextColors.disabled, 'Disabled', TRAVEL_MAP_CONFIG.floatingTextDuration, 0)
        }
        if (shieldDamage > 0 || hullDamage > 0) {
            this.travelMap.animations.push(new DamageFlickerAnim(this.travelMap.cvs.getObject(`ship-${ship.uuid}`), ship, hullDamage <= 0, this.travelMap))
        }
        else if (shieldDamage < 0 || hullDamage < 0) {
            this.travelMap.animations.push(new HealFlickerAnim(this.travelMap.cvs.getObject(`ship-${ship.uuid}`), ship, hullDamage < 0, this.travelMap))
        }

        this.travelMap.shipHandler.updateShipStatBars(ship, this.travelMap.cvs.getObject(`ship-${ship.uuid}`))
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
     * Handles ship click events - both player and enemy ships
     * @param {Ship} ship - The ship that was clicked
     * @param {Object} shipGroupConfig - Configuration object with mirror flag
     */
    onClickShip(ship, shipGroupConfig) {
        console.log('Ship clicked:', ship.shipType.name, 'Fleet:', ship.fleet?.name, 'Mirror:', shipGroupConfig.mirror)
        if (!gs.fleet.ships.includes(ship)) {
            // Enemy ship clicked
            console.log('Enemy ship clicked, targetingMode:', this.targetingMode)
            if (this.targetingMode) {
                // Player is targeting this enemy ship for an attack
                if (ship.disabled || !this.targetedShips.has(ship)) {
                    return
                }
                
                const attackType = this.targetingMode
                this.targetingMode = null // Clear targeting mode
                this.targetingShip = null
                this.targetedShips.clear()
                
                // Execute the attack
                this.performAttack(attackType, ship)
            }
            else {
                this.travelMap.selectedShip = ship
            }
        } else {
            console.log('Setting selectedShip to:', ship.shipType.name)
            this.travelMap.selectedShip = ship
            
            // Update UI panel to reflect selection
        }
        this.travelMap.updateUIPanel()
    }

    /**
     * Performs an attack on the target ship (laser or ram)
     * @param {string} attackType - Type of attack ('laser' or 'ram')
     * @param {Ship} targetShip - The ship being attacked
     */
    performAttack(attackType, targetShip) {
        if (!this.travelMap.selectedShip || !gs.fleet.ships.includes(this.travelMap.selectedShip)) {
            return
        }

        // Calculate the result without executing it
        const result = gs.combat.calculateAction(this.travelMap.selectedShip, attackType, targetShip)
        this.travelMap.selectedShip.actionsRemaining--
        
        console.log('Combat result:', result)
        console.log('Shields absorbed:', result.shieldsAbsorbed, 'Hull damage:', result.hullDamage)
        
        // Display laser beam if it's a laser attack, or animate ram
        if (attackType === 'laser') {
            // Pass result to animateLaser - it will execute and display damage text when laser hits
            this.laserHandler.animateLaser(this.travelMap.selectedShip, targetShip, result)
        } else if (attackType === 'ram') {
            // Pass result to animateRam - it will execute and display damage text midway through animation
            this.ramHandler.animateRam(this.travelMap.selectedShip, targetShip, result)
        }
        
        // Deselect ship if it has no actions remaining
        if (this.travelMap.selectedShip.actionsRemaining <= 0) {
            this.travelMap.selectedShip = null
        }
        
        this.handleActionComplete()
        this.travelMap.updateUIPanel()
    }

}
