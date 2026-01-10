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
        const panel = ce({id: 'travel-ui-panel'})
        
        // Left side: Ship info and actions
        const leftPanel = ce({
            classNames: ['travel-ui-left-panel'],
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
        const {selectedPlayerShip} = this.travelMap
        
        const buttonContainer = ce({classNames: ['travel-action-buttons']})
        
        if (!selectedPlayerShip || selectedPlayerShip.disabled) {
            buttonContainer.appendChild(ce({
                innerHTML: 'No active ship',
                classNames: ['travel-action-button-inactive']
            }))
            return buttonContainer
        }
        
        // Create all action buttons
        buttonContainer.appendChild(this.createCombatButton('Laser', () => this.handleLaserAttack(), selectedPlayerShip.lasers <= 0))
        buttonContainer.appendChild(this.createCombatButton('Ram', () => this.handleRam()))
        buttonContainer.appendChild(this.createCombatButton('Evade', () => this.handleEvade()))
        buttonContainer.appendChild(this.createCombatButton('Recharge', () => this.handleRecharge()))
        buttonContainer.appendChild(this.createCombatButton('Flee', () => this.handleFlee()))
        
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
            classNames: ['travel-action-button'],
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
        const {selectedPlayerShip, selectedEnemyShip} = this.travelMap
        
        if (!selectedPlayerShip || !selectedEnemyShip) {
            gs.combat.addToCombatLog('Select a target first!')
            this.refreshCombatLog()
            return
        }
        
        if (selectedEnemyShip.disabled) {
            gs.combat.addToCombatLog('Target is already destroyed!')
            this.refreshCombatLog()
            return
        }
        
        const result = gs.combat.executeAction(selectedPlayerShip, 'laser', selectedEnemyShip)
        this.refreshCombatLog()
        
        if (result.success) {
            this.handleActionComplete()
        }
    }

    /**
     * Handles ram action
     */
    handleRam() {
        const {selectedPlayerShip, selectedEnemyShip} = this.travelMap
        
        if (!selectedPlayerShip || !selectedEnemyShip) {
            gs.combat.addToCombatLog('Select a target first!')
            this.refreshCombatLog()
            return
        }
        
        if (selectedEnemyShip.disabled) {
            gs.combat.addToCombatLog('Target is already destroyed!')
            this.refreshCombatLog()
            return
        }
        
        const result = gs.combat.executeAction(selectedPlayerShip, 'ram', selectedEnemyShip)
        this.refreshCombatLog()
        
        this.handleActionComplete()
    }

    /**
     * Handles evade action
     */
    handleEvade() {
        const {selectedPlayerShip} = this.travelMap
        if (!selectedPlayerShip) return
        
        const result = gs.combat.executeAction(selectedPlayerShip, 'evade')
        this.refreshCombatLog()
        
        this.handleActionComplete()
    }

    /**
     * Handles recharge action
     */
    handleRecharge() {
        const {selectedPlayerShip} = this.travelMap
        if (!selectedPlayerShip) return
        
        const result = gs.combat.executeAction(selectedPlayerShip, 'recharge')
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
        if (!logElement) return
        
        // Clear existing log
        logElement.innerHTML = ''
        
        // Display all messages from combat log
        for (const message of gs.combat.log.getAll()) {
            logElement.appendChild(ce({
                innerHTML: message,
                classNames: ['travel-log-message']
            }))
        }
        
        // Auto-scroll to bottom
        logElement.scrollTop = logElement.scrollHeight
    }
}
