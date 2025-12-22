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

        this.actorShieldDamage = null
        this.actorHullDamage = null
        this.actorDisabled = null
        this.targetShieldDamage = null
        this.targetHullDamage = null
        this.targetDisabled = null
        this.targetEscaped = null
        this.actorEscaped = null
        this.actorTurnComplete = null
    }

    execute() {
        console.log('ShipAction.execute', { encounter:this.encounter, actionType: this.actionType, actor: this.actor, target: this.target, toX: this.toX, toY: this.toY });
        let result;
        if (this.actionType == MOVE_TYPES.Move) {
            result = ShipAction.move(this)
        }
        else if (this.actionType == MOVE_TYPES.Attack) {
            result = ShipAction.attack(this)
        }
        else if (this.actionType == MOVE_TYPES.Ram) {
            result = ShipAction.ram(this)
        }
        else if (this.actionType == MOVE_TYPES.Recharge) {
            result = ShipAction.recharge(this)
        }
        else if (this.actionType == MOVE_TYPES.Wait) {
            result = ShipAction.wait(this)
        }
        else throw new Error(`Unknown move type: ${this.actionType}`)
        this.completed = true
        return result
    }

    static recharge(action = new ShipAction()) {
        console.log('ShipAction.recharge', { action });
        action.actor.numActionsRemaining--
        const rechargedAmt = action.actor.rechargeShields()
        Object.assign(action, {actorShieldDamage: -rechargedAmt})
    }

    static move(action =  new ShipAction()) {
        Object.assign(action.actor, {x: action.toX, y: action.toY, angle: action.angle})
        action.actor.numActionsRemaining--
        let actorEscaped = (action.encounter) ? action.encounter.checkShipEscaped(action.actor) : null
        Object.assign(action, {actorEscaped})
    }

    static ram(action =  new ShipAction()) {
        console.log('ShipAction.ram', { action});
        const {actor, target} = action

        Object.assign(actor, {x: action.toX, y: action.toY, angle: action.angle})

        const dmgModifier = action.path.distance/actor.maxMoveDistance

        const dmg = 1+rng(actor.maxRamDamage * dmgModifier)
        const selfDmg = 1+rng(actor.maxRamDamage/2 * dmgModifier)
        const [targetHullDamage, targetShieldDamage, targetDisabled] = target.takeDamage(dmg, true)
        const [actorHullDamage, actorShieldDamage, actorDisabled] = actor.takeDamage(selfDmg, true)

        const knockback = 1 + (10*dmgModifier*(actor.mass/target.mass)) + target.radius + actor.radius
        const [kx,ky] = rotatePoint(knockback, 0, 0, 0, action.angle)
        target.x += kx
        target.y += ky

        //seems buggy but let's try it out
        const actorEscaped = action.encounter.checkShipEscaped(actor)
        const targetEscaped = action.encounter.checkShipEscaped(target)

        actor.numActionsRemaining--
        Object.assign(action, {actorHullDamage, actorShieldDamage, actorDisabled, targetHullDamage, targetShieldDamage, targetDisabled, actorEscaped, targetEscaped})
    }

    static attack(action =  new ShipAction()) {
        console.log('ShipAction.attack', { attacker: action.actor, target: action.target });
        const dmg = 1+rng(action.actor.maxLaserDamage)
        action.actor.numActionsRemaining--
        const [targetHullDamage, targetShieldDamage, targetDisabled] = action.target.takeDamage(dmg)
        Object.assign(action, {targetHullDamage, targetShieldDamage, targetDisabled})
    }

    static wait(action =  new ShipAction()) {
        console.log('ShipAction.wait', { action });
        action.actor.numActionsRemaining = 0
    }
}