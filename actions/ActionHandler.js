class ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        this.encounterMap = encounterMap
        this.encounter = encounterMap.encounter
        this.cvs = encounterMap.cvs
    }

    startTargeting(actor = new Ship()) {
        console.log(`ActionHandler.startTargeting (${this.constructor.name})`, { actor });
        throw new Error('startTargeting must be implemented by subclass')
    }

    target(...args) {
        console.log(`ActionHandler.target (${this.constructor.name})`, { args });
        throw new Error('target must be implemented by subclass')
    }

    attempt(...args) {
        console.log(`ActionHandler.attempt (${this.constructor.name})`, { args });
        throw new Error('attempt must be implemented by subclass')
    }

    execute(action =  new ShipAction()) {
        console.log(`ActionHandler.execute (${this.constructor.name})`, { action });
        throw new Error('execute must be implemented by subclass')
    }

    calcCanBeControlled(ship = new Ship()) {
        const {activeTurnFleet, playerFleet} = this.encounter
        if (ship.fleet != activeTurnFleet) return false
        if (ship.numActionsRemaining <= 0) return false
        if (ship.fleet != playerFleet) return false
        return true
    }

    startAnimating(action = new ShipAction(), animation = new Loop()) {
        if (action && action.actorInfoMessage) {
            const popupId = `action_${Date.now()}_${Math.random()}`
            const txt = this.cvs.addText(`${popupId}_actor_info_message`, action.actor.x, action.actor.y, 0, -DEFAULT_FONT_SIZE, action.actorInfoMessage, COLORS.White)
            txt.setDurationMs(1000)
        }
        this.encounterMap.animations.push(animation)
        this.encounterMap.stopTargeting()
        //this.encounterMap.refresh()
    }

    completeAction(action = new ShipAction()) {
        console.log('ActionHandler.completeAction:',action)
        const pseudoActions = action.execute()
        if (action.actor.fleet == gs.fleet) this.encounterMap.selectedObject = action.actor
        action.addPopups(this.encounterMap.cvs)
        ActionHandler.checkOnDisabledEffects(action)
        for (const a of pseudoActions) {
            //if any ships killed, do some special logic here
            ActionHandler.checkOnDisabledEffects(a)
            a.addPopups(this.encounterMap.cvs)
        }
        this.encounterMap.refresh()
    }

    static checkOnDisabledEffects(action = new ShipAction()) {
        if (action.actorDisabled && action.actor.shipType.onDisabled) {
            action.actor.shipType.onDisabled(action.actor, action.encounter)
        }
        if (action.targetDisabled && action.target.shipType.onDisabled) {
            action.target.shipType.onDisabled(action.target, action.encounter)
        }
    }
}
