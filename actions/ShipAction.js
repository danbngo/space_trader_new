class ShipAction {
    constructor(encounter, actor, actionType = MOVE_TYPES_ALL[0], target = null, toX = undefined, toY = undefined, targetToX = undefined, targetToY = undefined) {
        console.log('ShipAction.constructor', { encounter, actor, actionType, target, toX, toY });
        this.encounter = encounter
        this.actionType = actionType
        this.actor = actor
        this.target = target
        this.toX = toX !== undefined ? toX : target ? target.x : actor ? actor.x : undefined
        this.toY = toY !== undefined ? toY : target ? target.y : actor ? actor.y : undefined
        this.targetToX = targetToX
        this.targetToY = targetToY
        this.startX = actor ? actor.x : undefined
        this.startY = actor ? actor.y : undefined
        this.targetStartX = target ? target.x : undefined
        this.targetStartY = target ? target.y : undefined
        this.path = this.startX !== undefined && this.startY !== undefined && this.toX !== undefined && this.toY !== undefined ? new Path(this.startX, this.startY, this.toX, this.toY) : undefined
        //this.angle = this.path ? this.path.angle : undefined
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
        this.actorGoodMessage = null
        this.actorInfoMessage = null
        this.targetGoodMessage = null
        this.targetBadMessage = null
        this.targetInfoMessage = null
    }
    get angle() {
        return this.path.angle
    }

    /**
     * @returns {ShipAction[]} An array of ShipAction instances representing the results of executing this action.
     */
    execute() {
        console.log('ShipAction.execute - base class placeholder', { encounter:this.encounter, actionType: this.actionType, actor: this.actor, target: this.target, toX: this.toX, toY: this.toY });
        // Override this method in subclasses
        throw new Error('execute() must be implemented in subclass')
    }

    addPopups(cvs = new CanvasWrapper()) {
        console.log('adding popups for action', this, 'to canvas:', cvs);
        const {actor, target, actorBadMessage, targetBadMessage, targetGoodMessage, actorGoodMessage, actorHullDamage, actorShieldDamage, actorDisabled, actorEscaped, targetHullDamage, targetShieldDamage, targetDisabled, targetEscaped} = this
        const popupId = `action_${Date.now()}_${Math.random()}`
        let actorYOffset = -DEFAULT_FONT_SIZE
        let targetYOffset = -DEFAULT_FONT_SIZE

        const result = []

        if (actorHullDamage) {
            result.push(cvs.addText(`${popupId}_actor_hull`, actor.x, actor.y, 0, actorYOffset, `${dnc(-actorHullDamage)}hp`, COLORS.LightGray))
            actorYOffset -= DEFAULT_FONT_SIZE
        }
        if (actorShieldDamage) {
            result.push(cvs.addText(`${popupId}_actor_shield`, actor.x, actor.y, 0, actorYOffset, `${dnc(-actorShieldDamage)}sp`, COLORS.Blue))
            actorYOffset -= DEFAULT_FONT_SIZE
        }
        if (actorDisabled) {
            result.push(cvs.addText(`${popupId}_actor_disabled`, actor.x, actor.y, 0, actorYOffset, actor.aiType == AI_TYPES.Ship ? `Disabled!` : `Destroyed!`, COLORS.LightGray))
            actorYOffset -= DEFAULT_FONT_SIZE
        }
        else if (actorEscaped) {
            result.push(cvs.addText(`${popupId}_actor_escaped`, actor.x, actor.y, 0, actorYOffset, actor.aiType == AI_TYPES.Ship ? `Escaped!` : `Gone!`, COLORS.Orange))
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

        if (targetHullDamage) {
            result.push(cvs.addText(`${popupId}_target_hull`, target.x, target.y, 0, targetYOffset, `${dnc(-targetHullDamage)}hp`, COLORS.LightGray))
            targetYOffset -= DEFAULT_FONT_SIZE
        }
        if (targetShieldDamage) {
            result.push(cvs.addText(`${popupId}_target_shield`, target.x, target.y, 0, targetYOffset, `${dnc(-targetShieldDamage)}sp`, COLORS.Blue))
            targetYOffset -= DEFAULT_FONT_SIZE
        }
        if (targetDisabled) {
            result.push(cvs.addText(`${popupId}_target_disabled`, target.x, target.y, 0, targetYOffset, target.aiType == AI_TYPES.Ship ? `Disabled!` : `Destroyed!`, COLORS.LightGray))
            targetYOffset -= DEFAULT_FONT_SIZE
        }
        else if (targetEscaped) {
            result.push(cvs.addText(`${popupId}_target_escaped`, target.x, target.y, 0, targetYOffset, target.aiType == AI_TYPES.Ship ? `Escaped!` : `Gone!`, COLORS.Orange))
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

        for (const r of result) r.setDurationMs()

        console.log('ShipAction.addPopups result:', result)

        return result
    }

    static getDamageAction(encounter, target = new Ship(), hullDamage = 0, shieldDamage = 0, disabled = false, escaped = false) {
        const pseudoShipAction = new ShipAction(encounter, null, null, target)
        pseudoShipAction.targetShieldDamage = shieldDamage
        pseudoShipAction.targetHullDamage = hullDamage
        pseudoShipAction.targetDisabled = disabled
        pseudoShipAction.targetEscaped = escaped
        return pseudoShipAction
    }

    handleCollisions() {
        const pseudoActions = []
        const COLLISION_BUFFER = 0.1 // Small additional amount for collision detection
        const PUSH_DISTANCE_MULTIPLIER = 1.2 // How far to push ships away
        const MAX_COLLISION_DAMAGE = 6 // Base damage dealt on collision
        
        // Check all other ships in the encounter
        for (const otherShip of this.encounter.ships) {
            // Skip self, disabled ships, and escaped ships
            if (otherShip === this.actor || otherShip.disabled || otherShip.escaped) continue
            
            // Try polygon collision detection first (more accurate)
            let isColliding = false;
            const actorPolygon = this.actor.getPolygonShape();
            const otherPolygon = otherShip.getPolygonShape();
            
            if (actorPolygon && otherPolygon) {
                // Use polygon-circle collision detection
                // Check if actor polygon intersects with other ship's circular approximation
                isColliding = actorPolygon.circleIntersectsWithPolygon(
                    otherShip.x, 
                    otherShip.y, 
                    otherShip.radius + COLLISION_BUFFER
                );
                
                // Double-check with other ship's polygon if first check passes
                if (isColliding || otherPolygon.circleIntersectsWithPolygon(
                    this.actor.x,
                    this.actor.y,
                    this.actor.radius + COLLISION_BUFFER
                )) {
                    isColliding = true;
                }
            } else {
                // Fallback to circle-circle collision detection if no polygon shape
                const distance = calcDistance(this.actor.x, this.actor.y, otherShip.x, otherShip.y);
                const collisionRadius = this.actor.radius + otherShip.radius + COLLISION_BUFFER;
                isColliding = distance < collisionRadius;
            }
            
            // Check if ships are overlapping
            if (isColliding) {
                console.log('Ship collision detected:', this.actor.name, otherShip.name)
                
                // Calculate mass ratio for physics
                const actorMass = this.actor.mass
                const otherMass = otherShip.mass
                const totalMass = actorMass + otherMass
                
                // Mass ratio: how much force the other ship takes (0 to 1)
                // Heavier ship takes less force, lighter ship takes more
                const otherShipMassRatio = actorMass / totalMass
                const actorMassRatio = otherMass / totalMass
                
                // Calculate angle from moving ship to other ship
                const dx = otherShip.x - this.actor.x
                const dy = otherShip.y - this.actor.y
                const angle = Math.atan2(dy, dx)
                
                // Calculate base push distance (use radii as approximation for separation)
                const basePushDistance = (this.actor.radius + otherShip.radius + COLLISION_BUFFER) * PUSH_DISTANCE_MULTIPLIER
                
                // Push the other ship away (proportional to its mass ratio)
                const otherShipPushDistance = basePushDistance * otherShipMassRatio
                const x = otherShip.x + Math.cos(angle) * otherShipPushDistance
                const y = otherShip.y + Math.sin(angle) * otherShipPushDistance
                
                Object.assign(otherShip, {x, y})
                pseudoActions.push(...this.encounter.checkShipMovementEffects(otherShip))
                
                // Push the actor ship back (proportional to its mass ratio)
                const actorPushDistance = basePushDistance * actorMassRatio
                const actorX = this.actor.x - Math.cos(angle) * actorPushDistance
                const actorY = this.actor.y - Math.sin(angle) * actorPushDistance
                
                Object.assign(this.actor, {x: actorX, y: actorY})
                pseudoActions.push(...this.encounter.checkShipMovementEffects(this.actor))
                
                // Check if ships are enemies
                const areEnemies = (this.actor.fleet !== otherShip.fleet)
                
                if (areEnemies) {
                    // Deal collision damage based on mass ratio
                    console.log('Enemy collision - dealing mass-based damage to both ships')
                    
                    // Heavier ship takes less damage, lighter ship takes more
                    const otherShipDamage = Math.ceil(MAX_COLLISION_DAMAGE * actorMassRatio * Math.random())
                    const actorDamage = Math.ceil(MAX_COLLISION_DAMAGE * otherShipMassRatio * Math.random())

                    this.actor.takeDamage(actorDamage, true)
                    otherShip.takeDamage(otherShipDamage, true)
                    
                    // Damage to the other ship (inversely proportional to its mass)
                    const damageAction1 = ShipAction.getDamageAction(
                        this.encounter, 
                        otherShip, 
                        otherShipDamage, 
                    )
                    pseudoActions.push(damageAction1)
                    
                    // Damage to the moving ship (inversely proportional to its mass)
                    const damageAction2 = ShipAction.getDamageAction(
                        this.encounter, 
                        this.actor, 
                        actorDamage, 
                    )
                    pseudoActions.push(damageAction2)
                }
            }
        }
        
        return pseudoActions
    }

}