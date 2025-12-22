class RechargeActionHandler extends ActionHandler {
    constructor(encounterMap = new EncounterMap()) {
        super(encounterMap)
    }

    startTargeting(ship = new Ship()) {
        // Recharge doesn't need targeting, so this can be skipped
        // Just call attempt directly
        this.attempt(ship)
    }

    target(...args) {
        // No targeting needed for recharge
    }

    attempt(ship = new Ship()) {
        console.log('RechargeActionHandler.attempt', { ship });
        if (ship.shields[0] >= ship.shields[1]) return
        this.execute(new ShipAction(this.encounter, ship, MOVE_TYPES.Recharge))
    }

    execute(action =  new ShipAction()) {
        console.log('RechargeActionHandler.execute', { action });
        this.encounterMap.animatingAction = action
        const animations = this.encounterMap.animations
        const ship = action.actor
        const animCircle = this.cvs.addFilledCircle('rechargecircle', ship.x, ship.y, ship.radius*1.5, 16, COLORS.LightBlue, 0)
        const rechargeDuration = 500
        
        animations.push(new Loop(rechargeDuration, (progressRatio)=>{
            // go from 0 to 1.0 to 0
            progressRatio = progressRatio < 0.5 ? progressRatio*2 : (1 - progressRatio)*2
            animCircle.fillColor[3] = progressRatio
            animCircle.radiusX = ship.radius*1.5 * (progressRatio)
            animCircle.radiusY = ship.radius*1.5 * (progressRatio)
        }, ()=>{
            action.execute()
            this.cvs.deleteObject(animCircle)
            this.encounterMap.showActionPopup(action)
            this.encounterMap.stopAnimating()
        }))
        
        this.startAnimating()
    }
}
