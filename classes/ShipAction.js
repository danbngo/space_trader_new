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
        this.actorBadMessage = null
        this.targetBadMessage = null
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
        else if (this.actionType == MOVE_TYPES.Blink) {
            result = ShipAction.blink(this)
        }
        else if (this.actionType == MOVE_TYPES.Booster) {
            result = ShipAction.booster(this)
        }
        else if (this.actionType == MOVE_TYPES.Cloak) {
            result = ShipAction.cloak(this)
        }
        else if (this.actionType == MOVE_TYPES.Warhead) {
            result = ShipAction.warhead(this)
        }
        else if (this.actionType == MOVE_TYPES.EMPPulse) {
            result = ShipAction.empPulse(this)
        }
        else if (this.actionType == MOVE_TYPES.GravitonBeam) {
            result = ShipAction.gravitonBeam(this)
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

        //player has a 75% chance to miss at min range and 25% at max range
        const didMiss = action.path.distance > 0 ? (Math.random() < (0.75 - (0.5 * (action.path.distance / actor.maxMoveDistance)))) : false
        if (didMiss) {
            Object.assign(action, {targetBadMessage: 'Missed!'})
        } 
        else {
            const dmgModifier = action.path.distance/actor.maxMoveDistance

            const dmg = 1+rng(actor.maxRamDamage * dmgModifier)
            const selfDmg = 1+rng(actor.maxRamDamage/2 * dmgModifier)
            const [targetHullDamage, targetShieldDamage, targetDisabled] = target.takeDamage(dmg, true)
            const [actorHullDamage, actorShieldDamage, actorDisabled] = actor.takeDamage(selfDmg, true)

            const knockback = 1 + (AVERGE_RAMMING_KNOCKBACK_DISTANCE*dmgModifier*(actor.mass/target.mass)) + target.radius + actor.radius
            const [kx,ky] = rotatePoint(knockback, 0, 0, 0, action.angle)
            target.x += kx
            target.y += ky
            target.angle = Math.random()*Math.PI*2
            const targetEscaped = action.encounter.checkShipEscaped(target)
            Object.assign(action, {actorHullDamage, actorShieldDamage, actorDisabled, targetHullDamage, targetShieldDamage, targetDisabled, targetEscaped})
        }

        //seems buggy but let's try it out
        const actorEscaped = action.encounter.checkShipEscaped(actor)
        Object.assign(action, {actorEscaped})

        actor.numActionsRemaining--
    }

    static attack(action =  new ShipAction()) {
        console.log('ShipAction.attack', { attacker: action.actor, target: action.target });
        //player has a 0% chance to miss at min range and 75% at max range
        const didMiss = action.path.distance > 0 ? (Math.random() < (0.75 * (action.path.distance / action.actor.maxAttackDistance))) : false
        if (didMiss) {
            Object.assign(action, {targetBadMessage: 'Missed!'})
        } 
        else {
            const dmg = 1+rng(action.actor.maxLaserDamage)
            const [targetHullDamage, targetShieldDamage, targetDisabled] = action.target.takeDamage(dmg)
            Object.assign(action, {targetHullDamage, targetShieldDamage, targetDisabled})
        }
        action.actor.numActionsRemaining--
    }

    static wait(action =  new ShipAction()) {
        console.log('ShipAction.wait', { action });
        action.actor.numActionsRemaining = 0
    }

    static booster(action = new ShipAction()) {
        console.log('ShipAction.booster', { action });
        const ship = action.actor
        const boostDistance = 10
        
        // Move ship in the direction it's facing
        const [dx, dy] = rotatePoint(boostDistance, 0, 0, 0, ship.angle)
        const newX = ship.x + dx
        const newY = ship.y + dy
        
        // Find enemy ships along the boost path and spin them
        const spinRadius = 10 * ship.radius
        const enemyShips = action.encounter.ships.filter(s => s.fleet !== ship.fleet && !s.isDisabled())
        
        for (const enemy of enemyShips) {
            const distToEnemy = calcDistance(ship.x, ship.y, enemy.x, enemy.y)
            if (distToEnemy <= spinRadius) {
                // Spin the enemy ship to a random angle
                enemy.angle = rng(Math.PI * 2, 0, false)
            }
        }
        
        // Update ship position
        Object.assign(ship, { x: newX, y: newY })
        
        ship.numActionsRemaining--
        
        // Check if ship escaped the map
        if (action.encounter) action.encounter.checkShipEscaped(ship)
        
        // Set cooldown
        ship.moduleCooldowns.setAmount(SHIP_MODULES.BOOSTER, SHIP_MODULES.BOOSTER.cooldown)
    }

    static blink(action = new ShipAction()) {
        console.log('ShipAction.blink', { action });
        const ship = action.actor
        const blinkDistance = 5
        
        // Teleport to random nearby position
        const randomAngle = rng(Math.PI * 2, 0, false)
        const [dx, dy] = rotatePoint(blinkDistance, 0, 0, 0, randomAngle)
        const newX = ship.x + dx
        const newY = ship.y + dy
        
        // Randomize ship angle
        ship.angle = rng(Math.PI * 2, 0, false)
        
        // Update ship position
        Object.assign(ship, { x: newX, y: newY })
        
        ship.numActionsRemaining--
        
        // Check if ship escaped the map
        if (action.encounter) action.encounter.checkShipEscaped(ship)
        
        // Set cooldown
        ship.moduleCooldowns.setAmount(SHIP_MODULES.BLINK, SHIP_MODULES.BLINK.cooldown)
    }

    static cloak(action = new ShipAction()) {
        console.log('ShipAction.cloak', { action });
        const {actor} = action
        actor.cloakedTurnsRemaining = 2
        actor.numActionsRemaining--
        
        // Set cooldown
        actor.moduleCooldowns.setAmount(SHIP_MODULES.CLOAK, SHIP_MODULES.CLOAK.cooldown)
    }

    static warhead(action = new ShipAction()) {
        console.log('ShipAction.warhead', { action });
        const attacker = action.actor
        const explosionX = action.toX
        const explosionY = action.toY
        const explosionRadius = attacker.maxAttackDistance * 0.5
        
        // Find all ships within explosion radius
        const affectedShips = action.encounter.ships.filter(ship => {
            if (ship === attacker || ship.isDisabled() || ship.escaped) return false
            const dist = calcDistance(explosionX, explosionY, ship.x, ship.y)
            return dist <= explosionRadius
        })
        
        // Deal damage and knockback to affected ships
        for (const ship of affectedShips) {
            const dist = calcDistance(explosionX, explosionY, ship.x, ship.y)
            // Damage falls off with distance
            const damageRatio = 1 - (dist / explosionRadius)
            const damage = attacker.maxLaserDamage * 2 * damageRatio
            
            ship.takeDamage(damage)
            
            // Apply knockback
            const knockbackDistance = explosionRadius * 0.5 * damageRatio
            const angle = Math.atan2(ship.y - explosionY, ship.x - explosionX)
            const [kx, ky] = rotatePoint(knockbackDistance, 0, 0, 0, angle)
            ship.x += kx
            ship.y += ky
            
            // Check if knocked out of bounds
            action.encounter.checkShipEscaped(ship)
        }
        
        attacker.numActionsRemaining--
        
        // Set cooldown
        attacker.moduleCooldowns.setAmount(SHIP_MODULES.WARHEAD, SHIP_MODULES.WARHEAD.cooldown)
    }

    static empPulse(action = new ShipAction()) {
        console.log('ShipAction.empPulse', { action });
        const attacker = action.actor
        const pulseRadius = attacker.maxAttackDistance * 2
        
        // Find all ships within pulse radius
        const affectedShips = action.encounter.ships.filter(ship => {
            if (ship === attacker || ship.isDisabled() || ship.escaped) return false
            const dist = calcDistance(attacker.x, attacker.y, ship.x, ship.y)
            return dist <= pulseRadius
        })
        
        // Reset shields and increase cooldowns
        for (const ship of affectedShips) {
            // Reset shields to 0
            ship.shields[0] = 0
            
            // Increase all module cooldowns by 1
            for (const moduleType of Object.values(SHIP_MODULES)) {
                const currentCooldown = ship.moduleCooldowns.getAmount(moduleType)
                ship.moduleCooldowns.setAmount(moduleType, currentCooldown + 1)
            }
        }
        
        attacker.numActionsRemaining--
        
        // Set cooldown
        attacker.moduleCooldowns.setAmount(SHIP_MODULES.EMP_PULSE, SHIP_MODULES.EMP_PULSE.cooldown)
    }

    static gravitonBeam(action = new ShipAction()) {
        console.log('ShipAction.gravitonBeam', { action });
        const attacker = action.actor
        const target = action.target
        
        // Calculate pull distance - target gets pulled more than attacker
        const distance = calcDistance(attacker.x, attacker.y, target.x, target.y)
        const targetPullDistance = Math.min(distance * 0.6, attacker.maxAttackDistance)
        const attackerPullDistance = Math.min(distance * 0.3, attacker.maxAttackDistance * 0.5)
        
        // Pull target towards attacker
        const angleToAttacker = Math.atan2(attacker.y - target.y, attacker.x - target.x)
        const [targetDx, targetDy] = rotatePoint(targetPullDistance, 0, 0, 0, angleToAttacker)
        target.x += targetDx
        target.y += targetDy
        
        // Pull attacker towards target (less than target is pulled)
        const angleToTarget = Math.atan2(target.y - attacker.y, target.x - attacker.x)
        const [attackerDx, attackerDy] = rotatePoint(attackerPullDistance, 0, 0, 0, angleToTarget)
        attacker.x += attackerDx
        attacker.y += attackerDy
        
        // Check if either ship escaped
        action.encounter.checkShipEscaped(target)
        action.encounter.checkShipEscaped(attacker)
        
        attacker.numActionsRemaining--
        
        // Set cooldown
        attacker.moduleCooldowns.setAmount(SHIP_MODULES.GRAVITON_BEAM, SHIP_MODULES.GRAVITON_BEAM.cooldown)
    }
}