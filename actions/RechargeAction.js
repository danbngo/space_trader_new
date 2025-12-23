class RechargeAction extends ShipAction {
    constructor(encounter = new Encounter(), actor = new Ship()) {
        super(encounter, actor, MOVE_TYPES.Recharge)
        this.actorInfoMessage = 'Recharging!'
    }

    execute() {
        console.log('RechargeAction.execute', { actor: this.actor });
        this.actor.numActionsRemaining--
        const rechargedAmt = this.actor.rechargeShields()
        Object.assign(this, {actorShieldDamage: -rechargedAmt})
        this.completed = true
    }
}
