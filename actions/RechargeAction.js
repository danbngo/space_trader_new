class RechargeAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Recharge)
        //this.actorInfoMessage = 'Recharging!' //clutter-y
    }

    execute() {
        console.log('RechargeAction.execute', { actor: this.actor });
        // Check if ship is overheated - if so, can't recharge shields
        const rechargedAmt = this.actor.rechargeShields()
        Object.assign(this, {actorShieldDamage: -rechargedAmt})
        const pseudoActions = this.encounter.handleShipActionComplete(this.actor)
        const rcPseudoAction = ShipAction.getDamageAction(this.encounter, this.actor, 0, -rechargedAmt)
        pseudoActions.push(rcPseudoAction)
        this.completed = true
        return pseudoActions
    }
}
