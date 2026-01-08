class RechargeActionHandler extends ActionHandler {
    constructor(encounterMap) {
        super(encounterMap)
    }

    startTargeting(ship ) {
        // Recharge doesn't need targeting, so this can be skipped
        // Just call attempt directly
        this.attempt(ship)
    }

    target(...args) {
        // No targeting needed for recharge
    }

    attempt(ship ) {
        console.log('RechargeActionHandler.attempt', { ship });
        if (ship.shields[0] >= ship.shields[1]) return
        this.execute(new RechargeAction(this.encounter, ship))
    }

    execute(action =  new RechargeAction()) {
        console.log('RechargeActionHandler.execute', { action });
        
        
        const ship = action.actor
        const popupId = `recharge_${Date.now()}_${Math.random()}`
        const animCircle = this.cvs.addFilledCircle(popupId, ship.x, ship.y, ship.radius*1.5, 16, COLORS.Blue, 0)
        const rechargeDuration = 500
        
        const animation = new Loop(rechargeDuration, (progressRatio)=>{
            // go from 0 to 1.0 to 0
            progressRatio = progressRatio < 0.5 ? progressRatio*2 : (1 - progressRatio)*2
            animCircle.fillColor[3] = progressRatio
            animCircle.radiusX = ship.radius*1.5 * (progressRatio)
            animCircle.radiusY = ship.radius*1.5 * (progressRatio)
        }, ()=>{
            this.cvs.deleteObject(animCircle)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
