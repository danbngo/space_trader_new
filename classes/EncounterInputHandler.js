
class EncounterInputHandler {
    constructor(encounter = new Encounter()) {
        this.encounter = encounter
    }

    handlePlayerInput(elapsedSeconds = 0, onShipFire = (s = new Ship())=>{}) {
        const playerShip = this.encounter.playerShips.filter(s=>(s.manualCombat))[0]
        if (!playerShip) return

        const decel = uiKeysPressed['s'] || uiKeysPressed['arrowdown']
        const accel = uiKeysPressed['w'] || uiKeysPressed['arrowup']
        const turnLeft = uiKeysPressed['a'] || uiKeysPressed['arrowleft']
        const turnRight = uiKeysPressed['d'] || uiKeysPressed['arrowright']
        const fire = uiKeysPressed[' ']

        if (decel || accel || turnLeft || turnRight || fire) console.log('decel,accel,tl,tr,fire:',decel,accel,turnLeft,turnRight,fire)

        if (decel && !accel) playerShip.accelerate(elapsedSeconds, true)
        else if (accel && !decel) playerShip.accelerate(elapsedSeconds)
        if (turnLeft && !turnRight) playerShip.turn(elapsedSeconds)
        else if (turnRight && !turnLeft) playerShip.turn(elapsedSeconds, true)
        if (fire) onShipFire(playerShip)
    }

}

