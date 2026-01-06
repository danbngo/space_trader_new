class PlasmaSprayActionHandler extends ActionHandler {
    constructor(encounterMap) {
        super(encounterMap)
    }

    startTargeting(ship = new Ship()) {
        console.log('PlasmaSprayActionHandler.startTargeting', { ship });
        if (!this.calcCanBeControlled(ship)) return
        
        this.sourceShip = ship
        const encounter = this.encounterMap.encounter
        
        // Scale area with module quality (1.0 = baseline)
        const quality = ship.getModuleQuality(SHIP_MODULE_TYPES.PLASMA_SPRAY)
        this.areaMultiplier = quality
        
        const validTargets = encounter.calcPlasmaSprayTargets(ship, this.areaMultiplier)
        
        // Show targeting area even if no valid targets (like other action handlers)
        const [triangle1, triangle2] = ship.calcLaserAreas(ship.x, ship.y, this.areaMultiplier)
        
        const targetingArea1 = this.cvs.addEmptyTriangle('targetingarea1', triangle1.x, triangle1.y, triangle1.base, triangle1.height, 4, COLORS.Targeting, triangle1.angle)
        const targetingArea2 = this.cvs.addEmptyTriangle('targetingarea2', triangle2.x, triangle2.y, triangle2.base, triangle2.height, 4, COLORS.Targeting, triangle2.angle)
        
        this.encounterMap.onHoverObject = (hoveredObj) => this.target(hoveredObj)
        this.encounterMap.onSelectObject = (selectedObj) => this.attempt(ship, selectedObj)
        
        this.encounterMap.startTargeting('Plasma Spray', [targetingArea1, targetingArea2], validTargets)
    }

    target(target = new Ship()) {
        console.log('PlasmaSprayActionHandler.target', { target });
        // Just show that we're hovering over a valid target
        // The targeting areas already show the spray pattern
    }

    attempt(attacker = new Ship(), target = new Ship()) {
        console.log('PlasmaSprayActionHandler.attempt', { attacker, target });
        if (!this.encounterMap.validTargets.includes(target)) {
            return
        }
        
        const action = new PlasmaSprayAction(this.encounter, attacker, target)
        this.execute(action)
    }

    cancelTargeting() {
        console.log('PlasmaSprayActionHandler.cancelTargeting');
        this.encounterMap.cancelTargeting()
    }

    execute(action = new PlasmaSprayAction()) {
        console.log('PlasmaSprayActionHandler.execute', { action });
        
        const plasmaDuration = 600
        const attacker = action.actor
        const quality = attacker.getModuleQuality(SHIP_MODULE_TYPES.PLASMA_SPRAY)
        
        // Get all targets in spray area
        const sprayTargets = this.encounter.calcPlasmaSprayTargets(attacker, quality)
        
        // Create spray effect for both triangular areas
        const popupId = `plasmaSpray_${Date.now()}_${Math.random()}`
        const [triangle1, triangle2] = attacker.calcLaserAreas(attacker.x, attacker.y, quality)
        
        const spray1 = this.cvs.addEmptyTriangle(`${popupId}_1`, triangle1.x, triangle1.y, triangle1.base, triangle1.height, 0, COLORS.Orange, triangle1.angle)
        const spray2 = this.cvs.addEmptyTriangle(`${popupId}_2`, triangle2.x, triangle2.y, triangle2.base, triangle2.height, 0, COLORS.Orange, triangle2.angle)
        
        const animation = new Loop(plasmaDuration, (progressRatio) => {
            const alpha = 0.7 * (1 - progressRatio)
            spray1.fillColor = [COLORS.Orange[0], COLORS.Orange[1], COLORS.Orange[2], alpha]
            spray2.fillColor = [COLORS.Orange[0], COLORS.Orange[1], COLORS.Orange[2], alpha]
        }, () => {
            this.cvs.deleteObject(spray1)
            this.cvs.deleteObject(spray2)
            this.completeAction(action)
        })
        
        this.startAnimating(action, animation)
    }
}
