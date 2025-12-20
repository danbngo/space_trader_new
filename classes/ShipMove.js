class ShipMove {
    constructor(moveType = MOVE_TYPES_ALL[0], actor = new Ship(), target = null, toX = undefined, toY = undefined, startX = undefined, startY = undefined) {
        this.moveType = moveType
        this.actor = actor
        this.target = target
        this.toX = toX !== undefined ? toX : target ? target.x : actor.x
        this.toY = toY !== undefined ? toY : target ? target.y : actor.y
        this.startX = startX !== undefined ? startX : actor.x
        this.startY = startY !== undefined ? startY : actor.y
        this.path = new Path(this.startX, this.startY, this.toX, this.toY)
        this.completed = false
    }

    execute() {
        if (this.moveType == MOVE_TYPES.Move) {
            ShipMove.move(this.actor, this.toX, this.toY)
        }
        else if (this.moveType == MOVE_TYPES.Attack) {
            ShipMove.attack(this.actor, this.target)
        }
        else throw new Error(`Unknown move type: ${this.moveType}`)
        this.completed = true
    }

    static move(ship = new Ship(), tx = 0, ty = 0, angle = undefined) {
        if (!angle) {
            const path = new Path(ship.x, ship.y, tx, ty)
            angle = path.angle
        }
        ship.x = tx
        ship.y = ty
        ship.angle = angle
        ship.numMovesRemaining--
    }

    static attack(attacker = new Ship(), target = new Ship()) {
        const dmg = rng(attacker.maxLaserDamage, 1)
        target.takeDamage(dmg)
        attacker.numMovesRemaining--
    }


}