class ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), actionType = MOVE_TYPES_ALL[0], target = null, toX = undefined, toY = undefined, targetToX = undefined, targetToY = undefined) {
        console.log('ShipAction.constructor', { encounter, actor, actionType, target, toX, toY });
        this.encounter = encounter
        this.actionType = actionType
        this.actor = actor
        this.target = target
        this.toX = toX !== undefined ? toX : target ? target.x : actor.x
        this.toY = toY !== undefined ? toY : target ? target.y : actor.y
        this.targetToX = targetToX
        this.targetToY = targetToY
        this.startX = actor.x
        this.startY = actor.y
        this.targetStartX = target ? target.x : undefined
        this.targetStartY = target ? target.y : undefined
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
        this.actorGoodMessage = null
        this.targetGoodMessage = null
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
        const startX = ship.x
        const startY = ship.y
        const newX = action.toX
        const newY = action.toY
        
        // Find enemy ships along the boost path and spin them
        const spinRadius = 10 * ship.radius
        const enemyShips = action.encounter.ships.filter(s => s.fleet !== ship.fleet && !s.isDisabled())
        
        // Check multiple points along the path
        const numChecks = 10
        for (const enemy of enemyShips) {
            let isInPath = false
            
            // Check distance from enemy to multiple points along the path
            for (let i = 0; i <= numChecks; i++) {
                const progress = i / numChecks
                const checkX = startX + (newX - startX) * progress
                const checkY = startY + (newY - startY) * progress
                const distToEnemy = calcDistance(checkX, checkY, enemy.x, enemy.y)
                
                if (distToEnemy <= spinRadius) {
                    isInPath = true
                    break
                }
            }
            
            if (isInPath) {
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
        const blinkDistance = 25
        
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
        const explosionRadius = attacker.maxAttackDistance * 0.25
        
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
            const damage = 20 * damageRatio //attacker.maxLaserDamage * 2 * damageRatio
            
            ship.takeDamage(damage)
            
            // Apply knockback
            const knockbackDistance = 0.5 * damageRatio
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

    addPopups(cvs = new CanvasWrapper()) {
        const {actor, target, actorBadMessage, targetBadMessage, targetGoodMessage, actorGoodMessage, actorHullDamage, actorShieldDamage, actorDisabled, actorEscaped, targetHullDamage, targetShieldDamage, targetDisabled, targetEscaped} = this
        const popupId = `action_${Date.now()}_${Math.random()}`
        let actorYOffset = -DEFAULT_FONT_SIZE
        let targetYOffset = -DEFAULT_FONT_SIZE

        const result = []

        if (actorHullDamage > 0) {
            result.push(cvs.addText(`${popupId}_actor_hull`, actor.x, actor.y, 0, actorYOffset, `${dnc(-actorHullDamage)}hp`, COLORS.LightGray))
            actorYOffset -= DEFAULT_FONT_SIZE
        }
        if (actorShieldDamage > 0) {
            result.push(cvs.addText(`${popupId}_actor_shield`, actor.x, actor.y, 0, actorYOffset, `${dnc(-actorShieldDamage)}sp`, COLORS.Blue))
            actorYOffset -= DEFAULT_FONT_SIZE
        }
        if (actorDisabled) {
            result.push(cvs.addText(`${popupId}_actor_disabled`, actor.x, actor.y, 0, actorYOffset, `Disabled!`, COLORS.LightGray))
            actorYOffset -= DEFAULT_FONT_SIZE
        }
        else if (actorEscaped) {
            result.push(cvs.addText(`${popupId}_actor_escaped`, actor.x, actor.y, 0, actorYOffset, `Escaped!`, COLORS.Orange))
            actorYOffset -= DEFAULT_FONT_SIZE
        }
        else if (actorBadMessage) {
            result.push(cvs.addText(`${popupId}_actor_bad_message`, actor.x, actor.y, 0, actorYOffset, actorBadMessage, COLORS.Red))
            actorYOffset -= DEFAULT_FONT_SIZE
        }
        else if (actorGoodMessage) {
            result.push(cvs.addText(`${popupId}_actor_good_message`, actor.x, actor.y, 0, actorYOffset, actorGoodMessage, COLORS.LightGreen))
            actorYOffset -= DEFAULT_FONT_SIZE
        }

        if (targetHullDamage > 0) {
            result.push(cvs.addText(`${popupId}_target_hull`, target.x, target.y, 0, targetYOffset, `${dnc(-targetHullDamage)}hp`, COLORS.LightGray))
            targetYOffset -= DEFAULT_FONT_SIZE
        }
        if (targetShieldDamage > 0) {
            result.push(cvs.addText(`${popupId}_target_shield`, target.x, target.y, 0, targetYOffset, `${dnc(-targetShieldDamage)}sp`, COLORS.Blue))
            targetYOffset -= DEFAULT_FONT_SIZE
        }
        if (targetDisabled) {
            result.push(cvs.addText(`${popupId}_target_disabled`, target.x, target.y, 0, targetYOffset, `Disabled!`, COLORS.LightGray))
            targetYOffset -= DEFAULT_FONT_SIZE
        }
        else if (targetEscaped) {
            result.push(cvs.addText(`${popupId}_target_escaped`, target.x, target.y, 0, targetYOffset, `Escaped!`, COLORS.Orange))
            targetYOffset -= DEFAULT_FONT_SIZE
        }
        else if (targetBadMessage) {
            result.push(cvs.addText(`${popupId}_target_bad_message`, target.x, target.y, 0, targetYOffset, targetBadMessage, COLORS.Red))
            targetYOffset -= DEFAULT_FONT_SIZE
        }
        else if (targetGoodMessage) {
            result.push(cvs.addText(`${popupId}_target_good_message`, target.x, target.y, 0, targetYOffset, targetGoodMessage, COLORS.LightGreen))
            targetYOffset -= DEFAULT_FONT_SIZE
        }

        for (const r of result) r.setDurationMs(1000)

        return result
    }

}