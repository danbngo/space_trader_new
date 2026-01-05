class PlasmaSprayActionHandler extends ActionHandler {
    constructor(encounterMap) {
        super(encounterMap)
    }

    startTargeting(ship = new Ship()) {
        console.log('PlasmaSprayActionHandler.startTargeting', { ship });
        this.sourceShip = ship
        const encounter = this.encounterMap.encounter
        const validTargets = encounter.calcPlasmaSprayTargets(ship)
        
        if (validTargets.length === 0) {
            showModal('No Valid Targets', 'No targets in plasma spray range.', [['OK', () => closeModal()]])
            return
        }
        
        this.targetingMode = true
        this.updateTargetingOverlay()
    }

    updateTargetingOverlay() {
        if (!this.targetingMode || !this.sourceShip) return
        
        const map = this.encounterMap.map
        const encounter = this.encounterMap.encounter
        
        // Get the triangular spray areas (one on each side of ship)
        const [triangle1, triangle2] = this.sourceShip.calcLaserAreas()
        
        // Draw both triangular spray zones
        map.addEmptyTriangle('plasmaSprayArea1', triangle1.x, triangle1.y, triangle1.base, triangle1.height, 0.1, COLORS.Orange, triangle1.angle, () => this.confirmAction())
        map.addEmptyTriangle('plasmaSprayArea2', triangle2.x, triangle2.y, triangle2.base, triangle2.height, 0.1, COLORS.Orange, triangle2.angle, () => this.confirmAction())
        
        // Highlight all targets in range
        const validTargets = encounter.calcPlasmaSprayTargets(this.sourceShip)
        for (const target of validTargets) {
            map.addEmptyCircle(`plasmaSprayTarget_${target.id}`, target.x, target.y, target.size * 1.3, 0.1, COLORS.Orange, () => this.confirmAction())
        }
    }

    confirmAction() {
        if (!this.targetingMode || !this.sourceShip) return
        
        const encounter = this.encounterMap.encounter
        const validTargets = encounter.calcPlasmaSprayTargets(this.sourceShip)
        
        if (validTargets.length === 0) {
            this.cancelTargeting()
            return
        }
        
        // Use first valid target as the "target" parameter (for compatibility with action system)
        const action = new PlasmaSprayAction(encounter, this.sourceShip, validTargets[0])
        this.encounterMap.addAction(action)
        
        this.cancelTargeting()
    }

    cancelTargeting() {
        console.log('PlasmaSprayActionHandler.cancelTargeting');
        this.targetingMode = false
        this.sourceShip = null
        this.encounterMap.refreshCanvasObjects()
    }
}
