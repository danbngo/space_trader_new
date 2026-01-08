class CloakActionHandler extends ActionHandler {
    constructor(encounterMap ) {
        super(encounterMap)
    }

    startTargeting(ship ) {
        // Cloak doesn't need targeting, activate immediately
        this.attempt(ship)
    }

    target(...args) {
        // No targeting needed for cloak
    }

    attempt(ship ) {
        console.log('CloakActionHandler.attempt', { ship });
        // TODO: Check if ship can cloak (not already cloaked, etc.)
        const action = new CloakAction(this.encounter, ship)
        this.execute(action)
    }

    execute(action = new CloakAction()) {
        console.log('CloakActionHandler.execute', { action });
        
        const ship = action.actor
        const animDuration = 500
        
        // Visual effect: ship fades out/becomes translucent
        const shipObj = this.cvs.getObject(`ship${ship.uuid}`)
        const initialAlpha = shipObj.fillColor[3]
        
        const animation = new Loop(animDuration, (progressRatio) => {
            // Fade to 30% opacity
            shipObj.fillColor[3] = initialAlpha * (1 - progressRatio * 0.7)
        }, () => {
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
