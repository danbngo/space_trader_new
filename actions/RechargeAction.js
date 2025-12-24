class RechargeAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Recharge)
        //this.actorInfoMessage = 'Recharging!' //clutter-y
    }

    execute() {
        console.log('RechargeAction.execute', { actor: this.actor });
        this.encounter.handleShipActionComplete(this.actor)
        // Check if ship is overheated - if so, can't recharge shields
        if (this.actor.statusEffects.has(STATUS_EFFECTS.OVERHEATED)) {
            Object.assign(this, {actorBadMessage: 'Overheated! Cannot recharge!'})
        } else {
            const rechargedAmt = this.actor.rechargeShields()
            Object.assign(this, {actorShieldDamage: -rechargedAmt})
        }
        this.completed = true
        return []
    }
}
