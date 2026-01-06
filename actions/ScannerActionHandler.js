class ScannerActionHandler extends ActionHandler {
    constructor(encounterMap) {
        super(encounterMap)
    }

    startTargeting(ship = new Ship()) {
        console.log('ScannerActionHandler.startTargeting', { ship });
        if (!this.calcCanBeControlled(ship)) return

        this.encounterMap.targetingAreas = []
        
        // Scale scanner area with module quality (1.5x EMP pulse radius, then scaled by quality)
        const quality = ship.getModuleQuality(SHIP_MODULE_TYPES.SCANNER)
        const basePulseArea = ship.calcPulseArea()
        const scaledRadius = basePulseArea.radius * 1.5 * quality
        const scannerArea = new Circle(basePulseArea.x, basePulseArea.y, scaledRadius)
        
        // Show the scanner radius that will be affected
        const scannerCircle = this.cvs.addEmptyCircle('targetingarea', scannerArea.x, scannerArea.y, scannerArea.radius, 12, COLORS.LightCyan)
        
        // Calculate which enemies will be hit
        const validTargets = this.encounter.enemyFleet.ships.filter(target => {
            if (target.disabled || target.escaped) return false
            const distance = Math.hypot(target.x - ship.x, target.y - ship.y)
            return distance <= scannerArea.radius
        })
        
        this.encounterMap.cvs.onClickWorldXY = (x, y) => this.attempt(ship)
        this.encounterMap.cvs.objClickEnabled = false
        this.encounterMap.startTargeting('Scanner', [scannerCircle], validTargets)
    }

    target(...args) {
        // Scanner is always centered on ship, no dynamic targeting
    }

    attempt(ship = new Ship()) {
        console.log('ScannerActionHandler.attempt', { ship });
        this.encounterMap.cvs.objClickEnabled = true
        const action = new ScannerAction(this.encounter, ship)
        this.execute(action)
    }

    execute(action = new ScannerAction()) {
        console.log('ScannerActionHandler.execute', { action });
        
        const pseudoActions = []
        const ship = action.actor
        const scanDuration = 1200
        
        // Expanding scanner pulse ring - use quality-scaled radius
        const quality = ship.getModuleQuality(SHIP_MODULE_TYPES.SCANNER)
        const basePulseRadius = ship.calcPulseArea().radius * 1.5
        const maxRadius = basePulseRadius * quality
        
        const popupId = `scanner_${Date.now()}_${Math.random()}`
        const scannerRing = this.cvs.addEmptyCircle(popupId, ship.x, ship.y, 0, 12, COLORS.LightCyan, 3)
        
        const animation = new Loop(scanDuration, (progressRatio) => {
            scannerRing.radius = maxRadius * progressRatio
            scannerRing.lineWidth = 3 * (1 - progressRatio) // Fade out as it expands
        }, () => {
            this.cvs.deleteObject(scannerRing)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
