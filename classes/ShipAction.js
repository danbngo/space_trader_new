class ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), actionType = MOVE_TYPES_ALL[0], target = null, toX = undefined, toY = undefined, startX = undefined, startY = undefined) {
        console.log('ShipAction.constructor', { encounter, actor, actionType, target, toX, toY, startX, startY });
        this.encounter = encounter
        this.actionType = actionType
        this.actor = actor
        this.target = target
        this.toX = toX !== undefined ? toX : target ? target.x : actor.x
        this.toY = toY !== undefined ? toY : target ? target.y : actor.y
        this.startX = startX !== undefined ? startX : actor.x
        this.startY = startY !== undefined ? startY : actor.y
        this.path = new Path(this.startX, this.startY, this.toX, this.toY)
        this.angle = this.path.angle
        this.completed = false
    }

    execute() {
        console.log('ShipAction.execute', { encounter:this.encounter, actionType: this.actionType, actor: this.actor, target: this.target, toX: this.toX, toY: this.toY });
        if (this.actionType == MOVE_TYPES.Move) {
            ShipAction.move(this)
        }
        else if (this.actionType == MOVE_TYPES.Attack) {
            ShipAction.attack(this)
        }
        else if (this.actionType == MOVE_TYPES.Ram) {
            ShipAction.ram(this)
        }
        else if (this.actionType == MOVE_TYPES.Recharge) {
            ShipAction.recharge(this)
        }
        else if (this.actionType == MOVE_TYPES.Wait) {
            ShipAction.wait(this)
        }
        else throw new Error(`Unknown move type: ${this.actionType}`)
        this.completed = true
    }

    static recharge(action = new ShipAction()) {
        console.log('ShipAction.recharge', { action });
        action.actor.rechargeShields()
        action.actor.numActionsRemaining--
    }

    static move(action =  new ShipAction()) {
        Object.assign(action.actor, {x: action.toX, y: action.toY, angle: action.angle})
        action.actor.numActionsRemaining--
        if (action.encounter) action.encounter.checkShipEscaped(action.actor)
    }

    static ram(action =  new ShipAction()) {
        console.log('ShipAction.ram', { attacker: action.actor, target: action.target });
        Object.assign(action.actor, {x: action.toX, y: action.toY, angle: action.angle})

        const dmgModifier = action.path.distance/action.actor.maxMoveDistance

        const dmg = 1+rng(action.actor.maxRamDamage * dmgModifier)
        const selfDmg = 1+rng(action.actor.maxRamDamage/2 * dmgModifier)
        action.target.takeDamage(dmg, true)
        action.actor.takeDamage(selfDmg, true)

        const knockback = dmg/5 + action.target.radius + action.actor.radius
        const [kx,ky] = rotatePoint(knockback, 0, 0, 0, action.angle)
        action.target.x += kx
        action.target.y += ky

        action.actor.numActionsRemaining--
    }

    static attack(action =  new ShipAction()) {
        console.log('ShipAction.attack', { attacker: action.actor, target: action.target });
        const dmg = 1+rng(action.actor.maxLaserDamage)
        action.target.takeDamage(dmg)
        action.actor.numActionsRemaining--
    }

    static wait(action =  new ShipAction()) {
        console.log('ShipAction.wait', { action });
        action.actor.numActionsRemaining = 0
    }
}