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
        
        // Check if animations are playing
        const animationsPlaying = this.travelMap.animations.length > 0
        if (animationsPlaying) {
            buttonContainer.appendChild(ce({
                innerHTML: '(Calibrating...)',
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
        
        const result = gs.combat.calculateAction(selectedShip, 'flee')
        selectedShip.actionsRemaining--
        
        // Create flee animation to display the result
        const shipObj = this.travelMap.cvs.getObject(`ship-${selectedShip.uuid}`)
        this.travelMap.animations.push(new FleeAnim(shipObj, selectedShip, result, this.travelMap))
        
        // Deselect ship if it has no actions remaining
        if (selectedShip.actionsRemaining <= 0) {
            this.travelMap.selectedShip = null
        }
        
        // Wait for animations then complete action
        this.waitForAnimationsThenComplete()
        this.travelMap.updateUIPanel()
    }

    /**
     * Handles action completion - checks turn completion and switches turns if needed
     */
    handleActionComplete() {
        console.log('=== handleActionComplete called ===')
        // Check if combat should end first
        if (gs.combat.result) {
            console.log('Combat has ended with result:', gs.combat.result)
            gs.encounter.endCombat()
            return
        }
        
        console.log('Before handleTurnComplete - activeTurnFleet:', gs.combat.activeTurnFleet.name)
        // Let combat handle turn completion
        gs.combat.handleTurnComplete()
        console.log('After handleTurnComplete - activeTurnFleet:', gs.combat.activeTurnFleet.name)
        
        // If it's now enemy turn, execute AI after a brief delay
        if (gs.combat.activeTurnFleet === gs.combat.enemyFleet) {
            console.log('Detected enemy turn, scheduling enemy turn execution in 1s')
            setTimeout(() => {
                this.executeEnemyTurn()
            }, 1000)
        } else {
            console.log('Still player turn, refreshing display')
            // Refresh display for player's turn
            this.travelMap.refresh()
        }
    }

    /**
     * Executes enemy AI turn
     */
    executeEnemyTurn() {
        console.log('=== executeEnemyTurn called ===')
        const actions = gs.combat.executeEnemyTurn()
        console.log('Enemy turn actions:', actions)
        
        // Process actions sequentially (one at a time)
        this.enemyActionQueue = actions
        this.processNextEnemyAction()
    }

    /**
     * Processes the next enemy action in the queue
     */
    processNextEnemyAction() {
        if (this.enemyActionQueue.length === 0) {
            // All enemy actions complete
            console.log('All enemy actions complete')
            
            // Check if combat ended
            if (gs.combat.result) {
                console.log('Combat ended after enemy turn with result:', gs.combat.result)
                gs.encounter.endCombat()
                return
            }
            
            console.log('Enemy turn complete, switching back to player turn')
            // Switch back to player turn
            gs.combat.handleTurnComplete()
            // Refresh the display for player turn
            this.travelMap.refresh()
            return
        }
        
        // Get the next action
        const action = this.enemyActionQueue.shift()
        console.log('Processing enemy action:', action.action, 'from', action.ship.name)
        
        // Execute the action with animation
        if (action.action === 'laser') {
            console.log('Animating enemy laser from', action.ship.name, 'to', action.target.name)
            this.laserHandler.animateLaser(action.ship, action.target, action.result)
        } else if (action.action === 'ram') {
            console.log('Animating enemy ram from', action.ship.name, 'to', action.target.name)
            this.ramHandler.animateRam(action.ship, action.target, action.result)
        } else if (action.action === 'recharge') {
            console.log('Animating enemy recharge:', action.ship.name)
            this.rechargeHandler.animateRecharge(action.ship, action.result)
        }
        
        // Wait for this action's animation to complete before processing next
        this.waitForCurrentEnemyActionComplete()
    }

    /**
     * Waits for current enemy action animation to complete, then processes next
     */
    waitForCurrentEnemyActionComplete() {
        // Check if animations are still running
        const animationsRunning = this.travelMap.animations.length > 0
        console.log('=== waitForCurrentEnemyActionComplete ===', { 
            animationsRunning, 
            animationCount: this.travelMap.animations.length 
        })
        
        if (animationsRunning) {
            // Wait and check again
            setTimeout(() => {
                this.waitForCurrentEnemyActionComplete()
            }, 100)
        } else {
            console.log('Current enemy action animation complete, processing next')
            // Animation complete, process next action
            this.processNextEnemyAction()
        }
    }

    /**
     * Displays damage text over a ship based on combat result
     * @param {Ship} ship - The ship to display damage over
     * @param {number} hullDamage - Hull damage dealt (0 if none)
     * @param {number} shieldDamage - Shield damage dealt (0 if none)
     * @param {boolean} destroyed - Whether the ship was destroyed
     * @param {string} missedText - Text to display for a miss/failure (empty string = no miss)
     */
    displayDamageText(ship, hullDamage = 0, shieldDamage = 0, destroyed = false, missedText = '') {
        console.log('=== displayDamageText called ===', { ship: ship.shipType.name, hullDamage, shieldDamage, destroyed, missedText })
        if (hullDamage == 0 && shieldDamage == 0 && !destroyed && !missedText) {
            return
        }
        if (missedText) {
            this.displayTextOverShip(ship, TRAVEL_MAP_CONFIG.floatingTextColors.missed, missedText, TRAVEL_MAP_CONFIG.floatingTextDuration, 0)
            return
        }
        
        const isShieldHeal = shieldDamage < 0
        const isHullHeal = hullDamage < 0
        const shieldColor = isShieldHeal ? TRAVEL_MAP_CONFIG.floatingTextColors.shieldHeal : TRAVEL_MAP_CONFIG.floatingTextColors.shieldDamage
        const hullColor = isHullHeal ? TRAVEL_MAP_CONFIG.floatingTextColors.hullHeal : TRAVEL_MAP_CONFIG.floatingTextColors.hullDamage
        const shieldText = isShieldHeal ? `+${Math.abs(shieldDamage)}` : `-${shieldDamage}`
        const hullText = isHullHeal ? `+${Math.abs(hullDamage)}` : `-${hullDamage}`
        
        if (shieldDamage !== 0) {
            this.displayTextOverShip(ship, shieldColor, shieldText, TRAVEL_MAP_CONFIG.floatingTextDuration, -30)
        }
        if (hullDamage !== 0) {
            this.displayTextOverShip(ship, hullColor, hullText, TRAVEL_MAP_CONFIG.floatingTextDuration, 30)
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
        
        // Wait for animations to complete before handling action completion
        this.waitForAnimationsThenComplete()
        this.travelMap.updateUIPanel()
    }

    /**
     * Waits for all combat animations to complete, then handles action completion
     */
    waitForAnimationsThenComplete() {
        // Check if any player ships are still acting (animating)
        const anyActing = gs.fleet.ships.some(ship => ship.acting)
        console.log('=== waitForAnimationsThenComplete ===', { anyActing, actingShips: gs.fleet.ships.filter(s => s.acting).map(s => s.name) })
        
        if (anyActing) {
            // Wait and check again
            setTimeout(() => {
                this.waitForAnimationsThenComplete()
            }, 100)
        } else {
            // All animations complete, check if combat should end
            console.log('All animations complete')
            
            // Update combat result to check for victory/defeat
            gs.combat.updateCombatResult()
            
            // If all enemies are disabled/escaped (victory), end player turn immediately
            if (gs.combat.result === ENCOUNTER_RESULTS.Victory) {
                console.log('All enemies disabled - ending combat')
                gs.encounter.endCombat()
                return
            }
            
            console.log('Calling handleActionComplete')
            this.handleActionComplete()
        }
    }

}
