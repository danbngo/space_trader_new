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
        this.travelMap.restoreShipColors()
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
        console.log('=== refreshCombatLog called ===')
        const logElement = document.getElementById('travel-log')
        console.log('logElement:', logElement)
        if (!logElement) {
            console.log('No log element found!')
            return
        }
        
        console.log('gs.combat:', gs.combat)
        console.log('gs.combat.log:', gs.combat.log)
        const messages = gs.combat.log.getAll()
        console.log('Combat log messages:', messages)
        console.log('Number of messages:', messages.length)
        
        // Clear existing log but keep header
        logElement.innerHTML = ''
        logElement.appendChild(ce({
            innerHTML: '=== Combat Log ===',
            classNames: ['travel-log-header']
        }))
        
        // Display all messages from combat log
        for (const message of messages) {
            console.log('Adding message to log:', message)
            logElement.appendChild(ce({
                innerHTML: message,
                classNames: ['travel-log-message']
            }))
        }
        
        console.log('Log element innerHTML after update:', logElement.innerHTML)
        console.log('Log element children count:', logElement.children.length)
        
        // Auto-scroll to bottom
        logElement.scrollTop = logElement.scrollHeight
    }
}
