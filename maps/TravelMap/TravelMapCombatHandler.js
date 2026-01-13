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
        this.targetingMode = null // 'laser', 'ram', 'reposition', or null
        this.hoveredShip = null // Ship currently being hovered over
    }

    /**
     * Updates visual widgets like selection arrows
     */
    updateWidgets() {
        const {selectedShip} = this.travelMap
        const {hoveredShip} = this
        const selectionArrowId = 'selection-arrow'
        const hoverArrowId = 'hover-arrow'
        
        // Update selection arrow (green, for selected ship)
        if (!selectedShip || !gs.combat) {
            const existingArrow = this.travelMap.cvs.getObject(selectionArrowId)
            if (existingArrow) {
                this.travelMap.cvs.deleteObject(selectionArrowId)
            }
        } else {
            // Get ship's canvas object to position arrow
            const shipObj = this.travelMap.cvs.getObject(`ship-${selectedShip.uuid}`)
            if (shipObj) {
                // Determine if this is a player ship or enemy ship
                const isPlayerShip = gs.fleet.ships.includes(selectedShip)
                
                // Animate position and brightness using time-based oscillation
                const time = Date.now()
                const positionOscillation = Math.sin(time / 400) * 15 // Oscillates ±15 pixels over ~0.8 seconds (2x faster)
                const brightnessOscillation = Math.sin(time / 500) * 0.3 + 0.7 // Oscillates between 0.4 and 1.0 over 1 second (2x faster)
                
                // Position arrow to the left of player ships, right of enemy ships
                const arrowSize = TRAVEL_MAP_CONFIG.selectionArrowSize
                const arrowDistance = shipObj.size/2 + TRAVEL_MAP_CONFIG.selectionArrowDistance
                let arrowX, arrowAngle
                
                if (isPlayerShip) {
                    // Arrow to the left, pointing right (→), oscillates left-right
                    arrowX = shipObj.x - arrowDistance + positionOscillation
                    arrowAngle = 0 // Points right
                } else {
                    // Arrow to the right, pointing left (←), oscillates left-right
                    arrowX = shipObj.x + arrowDistance + positionOscillation
                    arrowAngle = Math.PI // Points left
                }
                
                // Create animated green color with oscillating brightness
                const animatedGreen = [
                    Math.floor(COLORS.Green[0] * brightnessOscillation),
                    Math.floor(COLORS.Green[1] * brightnessOscillation),
                    Math.floor(COLORS.Green[2] * brightnessOscillation),
                    1
                ]
                
                // Create or update arrow
                const existingArrow = this.travelMap.cvs.getObject(selectionArrowId)
                if (existingArrow) {
                    existingArrow.x = arrowX
                    existingArrow.y = shipObj.y
                    existingArrow.angle = arrowAngle
                    existingArrow.fillColor = animatedGreen
                } else {
                    this.travelMap.cvs.addFilledTriangle(
                        selectionArrowId,
                        arrowX,
                        shipObj.y,
                        arrowSize,
                        arrowSize,
                        3, // minScreenSize
                        animatedGreen,
                        arrowAngle,
                        null
                    )
                }
            }
        }
        
        // Update hover arrow (yellow/orange, for hovered enemy ship)
        //console.log('updateWidgets - hoveredShip check:', hoveredShip ? hoveredShip.name : 'null')
        //console.log('updateWidgets - in combat:', !!gs.combat)
        //console.log('updateWidgets - is hoveredShip an ally:', hoveredShip ? gs.fleet.ships.includes(hoveredShip) : 'N/A')
        
        if (!hoveredShip || !gs.combat || gs.fleet.ships.includes(hoveredShip)) {
            // Remove hover arrow if not hovering, not in combat, or hovering ally
            //console.log('updateWidgets - Removing/skipping hover arrow')
            const existingHoverArrow = this.travelMap.cvs.getObject(hoverArrowId)
            if (existingHoverArrow) {
                console.log('updateWidgets - Deleting existing hover arrow')
                this.travelMap.cvs.deleteObject(hoverArrowId)
            }
        } else {
            console.log('updateWidgets - Should show hover arrow for:', hoveredShip.name)
            // Get hovered ship's canvas object to position arrow
            const hoveredShipObj = this.travelMap.cvs.getObject(`ship-${hoveredShip.uuid}`)
            console.log('updateWidgets - hoveredShipObj found:', !!hoveredShipObj)
            if (hoveredShipObj) {
                // Animate position and brightness using time-based oscillation
                const time = Date.now()
                const positionOscillation = Math.sin(time / 400) * 15
                const brightnessOscillation = Math.sin(time / 500) * 0.3 + 0.7
                
                // Position arrow to the right of enemy ships, pointing left (←)
                const arrowSize = TRAVEL_MAP_CONFIG.selectionArrowSize
                const arrowDistance = hoveredShipObj.size/2 + TRAVEL_MAP_CONFIG.selectionArrowDistance
                const arrowX = hoveredShipObj.x + arrowDistance + positionOscillation
                const arrowAngle = Math.PI // Points left
                
                // Create animated yellow/orange color with oscillating brightness
                const animatedYellow = [
                    Math.floor(255 * brightnessOscillation),
                    Math.floor(200 * brightnessOscillation),
                    Math.floor(0 * brightnessOscillation),
                    1
                ]
                
                // Create or update hover arrow
                const existingHoverArrow = this.travelMap.cvs.getObject(hoverArrowId)
                if (existingHoverArrow) {
                    existingHoverArrow.x = arrowX
                    existingHoverArrow.y = hoveredShipObj.y
                    existingHoverArrow.angle = arrowAngle
                    existingHoverArrow.fillColor = animatedYellow
                } else {
                    this.travelMap.cvs.addFilledTriangle(
                        hoverArrowId,
                        arrowX,
                        hoveredShipObj.y,
                        arrowSize,
                        arrowSize,
                        3, // minScreenSize
                        animatedYellow,
                        arrowAngle,
                        null
                    )
                }
            }
        }
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
            infoElement.innerHTML = this.travelMap.animations.length > 0 ? '' : '(Select a ship)'
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
            const targetingLabel = targetingMode === 'laser' ? 'Targeting Laser' : 
                                  targetingMode === 'ram' ? 'Targeting Ram' :
                                  targetingMode === 'reposition' ? 'Targeting Reposition' : 'Targeting'
            
            buttonContainer.appendChild(ce({
                innerHTML: `<strong>${targetingLabel}</strong> - Select a target`,
                classNames: ['targeting-mode-label']
            }))
            
            // Show hit chance if hovering a valid target
            console.log('createActionButtons - hoveredShip:', this.hoveredShip ? this.hoveredShip.name : 'null')
            console.log('createActionButtons - targetedShips has hoveredShip:', this.hoveredShip ? this.targetedShips.has(this.hoveredShip) : 'null')
            console.log('createActionButtons - targetingMode:', targetingMode)
            
            if (this.hoveredShip && this.targetedShips.has(this.hoveredShip)) {
                console.log('createActionButtons - Should show hit chance display')
                if (targetingMode === 'laser' || targetingMode === 'ram') {
                    console.log('createActionButtons - Calculating hit chance for:', targetingMode)
                    // Calculate hit chance for this attack
                    let hitChance = 0
                    if (targetingMode === 'laser') {
                        hitChance = gs.combat.calculateHitChance(selectedShip, this.hoveredShip)
                    } else if (targetingMode === 'ram') {
                        // Calculate ram hit chance (includes position and engine factors)
                        const attackerRow = Math.abs(gs.combat.getRow(selectedShip))
                        const rowDistanceFactor = attackerRow / COMBAT_HIT_CHANCE_HALVED_AT_X_ROWS
                        const baseHitChance = COMBAT_HIT_CHANCE_AT_MIDDLE_ROW * (1 / Math.pow(2, rowDistanceFactor))
                        const engineRatio = selectedShip.engine / Math.max(1, this.hoveredShip.engine)
                        hitChance = baseHitChance * COMBAT_RAM_HIT_CHANCE_MODIFIER_AT_SAME_ENGINE_POWER * engineRatio
                        hitChance = Math.max(0.1, Math.min(0.9, hitChance))
                    }
                    
                    const hitPercent = Math.round(hitChance * 100)
                    buttonContainer.appendChild(ce({
                        innerHTML: `<div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                            Target: ${coloredName(this.hoveredShip)}<br/>
                            Hit Chance: <span style="color: ${hitPercent >= 75 ? '#0f0' : hitPercent >= 50 ? '#ff0' : '#f80'}">${hitPercent}%</span>
                        </div>`
                    }))
                }
            }
            
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
        buttonContainer.appendChild(ce({
            tag: 'button',
            innerHTML: 'Reposition',
            onClick: () => this.handleReposition()
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
     * Handles reposition action - enters targeting mode
     */
    handleReposition() {
        const {selectedShip} = this.travelMap
        if (!selectedShip) return
        
        // Enter targeting mode for reposition
        this.targetingMode = 'reposition'
        this.targetingShip = selectedShip
        this.targetedShips.clear()
        
        // Populate valid targets: all ships (ally + enemy, including disabled) within 1 row
        const allShips = [...gs.fleet.ships]
        if (gs.encounter && gs.encounter.fleet && gs.encounter.fleet.ships) {
            allShips.push(...gs.encounter.fleet.ships)
        }
        
        allShips.forEach(ship => {
            if (ship === selectedShip) return // Can't target self
            const rowDiff = gs.combat.getRowDifference(selectedShip, ship)
            if (rowDiff <= 1) {
                this.targetedShips.add(ship)
            }
        })
        
        this.travelMap.updateUIPanel()
    }

    /**
     * Executes reposition action with selected target
     * @param {Ship} target - The ship to swap rows with
     */
    executeReposition(target) {
        const {selectedShip} = this.travelMap
        if (!selectedShip || !target) return
        
        // Calculate reposition result
        const result = gs.combat.calculateAction(selectedShip, 'reposition', target)
        selectedShip.actionsRemaining--
        
        // Get canvas objects for both ships
        const shipObj = this.travelMap.cvs.getObject(`ship-${selectedShip.uuid}`)
        const targetObj = this.travelMap.cvs.getObject(`ship-${target.uuid}`)
        
        // Create reposition animation
        this.travelMap.animations.push(new RepositionAnim(shipObj, targetObj, selectedShip, target, result, this.travelMap))
        
        // Exit targeting mode
        this.targetingMode = null
        this.targetingShip = null
        this.targetedShips.clear()
        
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
        
        // If it's now enemy turn, wait for animations then execute AI
        if (gs.combat.activeTurnFleet === gs.combat.enemyFleet) {
            console.log('Detected enemy turn, waiting for animations to finish before starting')
            this.waitForAnimationsBeforeEnemyTurn()
        } else {
            console.log('Still player turn, refreshing display')
            // Auto-select first non-disabled player ship for new player turn, but only if no valid ship is already selected
            const currentlySelected = this.travelMap.selectedShip
            const isValidSelection = currentlySelected && 
                                    gs.combat.activePlayerShips.includes(currentlySelected) &&
                                    !currentlySelected.disabled && 
                                    !currentlySelected.escaped
            
            if (!isValidSelection) {
                const firstActiveShip = gs.combat.activePlayerShips[0] || null
                this.travelMap.selectedShip = firstActiveShip
                console.log('Auto-selected first player ship for new turn:', firstActiveShip?.name)
            } else {
                console.log('Keeping currently selected ship:', currentlySelected?.name)
            }
            
            // Refresh display and UI panel for player's turn
            this.travelMap.refresh()
            this.travelMap.updateUIPanel()
        }
    }

    /**
     * Waits for all animations to finish before starting enemy turn
     */
    waitForAnimationsBeforeEnemyTurn() {
        const animationsRunning = this.travelMap.animations.length > 0
        console.log('=== waitForAnimationsBeforeEnemyTurn ===', { animationsRunning, animationCount: this.travelMap.animations.length })
        
        if (animationsRunning) {
            // Wait and check again
            setTimeout(() => {
                this.waitForAnimationsBeforeEnemyTurn()
            }, 100)
        } else {
            console.log('All animations complete, starting enemy turn after 1s delay')
            setTimeout(() => {
                this.executeEnemyTurn()
            }, 1000)
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
            console.log('Current enemy action animation complete')
            
            // Check if combat ended (e.g., enemy ship rammed and destroyed itself, or all player ships disabled)
            gs.combat.updateCombatResult()
            if (gs.combat.result) {
                console.log('Combat ended during enemy turn with result:', gs.combat.result)
                gs.encounter.endCombat()
                return
            }
            
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
     * Handles ship hover events
     * @param {Ship|null} ship - The ship being hovered over, or null if no longer hovering
     */
    onHoverShip(ship) {
        console.log('=== onHoverShip called ===')
        console.log('Ship:', ship ? ship.name : 'null')
        console.log('Ship fleet:', ship ? ship.fleet?.name : 'null')
        console.log('Is enemy:', ship ? !gs.fleet.ships.includes(ship) : 'null')
        console.log('Current hoveredShip:', this.hoveredShip ? this.hoveredShip.name : 'null')
        console.log('targetingMode:', this.targetingMode)
        console.log('targetedShips size:', this.targetedShips.size)
        console.log('Is in targetedShips:', ship ? this.targetedShips.has(ship) : 'null')
        
        this.hoveredShip = ship
        console.log('Set hoveredShip to:', this.hoveredShip ? this.hoveredShip.name : 'null')
        
        this.travelMap.updateUIPanel()
        console.log('Called updateUIPanel()')
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
                // Handle different targeting modes
                if (this.targetingMode === 'reposition') {
                    // For reposition, can target any ship (including disabled)
                    this.executeReposition(ship)
                } else {
                    // For attacks, ship must not be disabled and must be valid target
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
            }
            else {
                this.travelMap.selectedShip = ship
            }
        } else {
            // Allied ship clicked
            console.log('Allied ship clicked, targetingMode:', this.targetingMode)
            if (this.targetingMode === 'reposition') {
                // For reposition, can target any allied ship (including disabled)
                this.executeReposition(ship)
            } else {
                // Normal selection
                console.log('Setting selectedShip to:', ship.shipType.name)
                this.travelMap.selectedShip = ship
            }
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
            
            // Update combat result to check for victory/defeat/escape
            gs.combat.updateCombatResult()
            
            // If combat has ended, end it immediately
            if (gs.combat.result) {
                console.log('Combat ended with result:', gs.combat.result)
                gs.encounter.endCombat()
                return
            }
            
            console.log('Calling handleActionComplete')
            this.handleActionComplete()
        }
    }

}
