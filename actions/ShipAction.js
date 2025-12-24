class ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship(), actionType = MOVE_TYPES_ALL[0], target = null, toX = undefined, toY = undefined, targetToX = undefined, targetToY = undefined) {
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

        for (const r of result) r.setDurationMs()

        return result
    }

    static getDamageAction(target = new Ship(), hullDamage = 0, shieldDamage = 0, disabled = false, escaped = false) {
        const pseudoShipAction = new ShipAction(null, null, null, target)
        pseudoShipAction.targetShieldDamage = shieldDamage
        pseudoShipAction.targetHullDamage = hullDamage
        pseudoShipAction.targetDisabled = disabled
        pseudoShipAction.targetEscaped = escaped
        return pseudoShipAction
    }
}