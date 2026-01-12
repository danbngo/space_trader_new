/**
 * Handles laser attack functionality for TravelMap combat
 */
class TravelMapCombatLaserHandler {
    /**
     * @param {TravelMapCombatHandler} combatHandler - Reference to parent combat handler
     */
    constructor(combatHandler) {
        this.combatHandler = combatHandler
        this.travelMap = combatHandler.travelMap
    }

    /**
     * Handles laser attack action
     */
    handleLaserAttack() {
        const {selectedShip} = this.travelMap
        // Enter targeting mode
        this.combatHandler.targetingMode = 'laser'
        this.combatHandler.targetingShip = selectedShip
        
        // Populate valid targets (all non-disabled enemy ships)
        this.combatHandler.targetedShips.clear()
        if (gs.encounter && gs.encounter.fleet && gs.encounter.fleet.ships) {
            gs.encounter.fleet.ships.forEach(ship => {
                if (!ship.disabled) {
                    this.combatHandler.targetedShips.add(ship)
                }
            })
        }
        
        this.travelMap.updateUIPanel() // Refresh to show targeting UI
    }

    /**
     * Animates a laser attack from attacker to target
     * @param {Ship} attacker - The ship firing the laser
     * @param {Ship} target - The ship being targeted
     * @param {Object} combatResult - The result of the laser attack
     */
    animateLaser(attacker, target, combatResult) {
        const attackerObj = this.travelMap.cvs.getObject(`ship-${attacker.uuid}`)
        const targetObj = this.travelMap.cvs.getObject(`ship-${target.uuid}`)
        if (!attackerObj || !targetObj) {
            console.warn('Could not find ship objects for laser animation')
            return
        }
        this.travelMap.animations.push(new LaserAnim(attackerObj, targetObj, attacker, target, combatResult, this.travelMap))
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
}
