/**
 * Handles rendering and updating of fleets (active and abandoned) on the star map
 */
class StarMapFleetsHandler {
    /**
     * @param {StarMap} starMap - Reference to the parent StarMap instance
     */
    constructor(starMap) {
        this.starMap = starMap
        this.cvs = starMap.cvs
        this.starSystem = starMap.starSystem
    }

    handleAll() {
        const perfStart = STARMAP_DEBUG_CONFIG.logPerformance ? performance.now() : 0;
        
        if (STARMAP_DEBUG_CONFIG.displayWaypoint) this.handleWaypoint();
        
        if (STARMAP_DEBUG_CONFIG.logPerformance) {
            const perfEnd = performance.now();
            console.log(`StarMapFleetsHandler.handleAll: ${(perfEnd - perfStart).toFixed(2)}ms`);
        }
    }

    /**
     * Set stroke style for fleet based on hover/selection state
     * @param {Fleet} fleet - The fleet to style
     * @param {Object} fleetObj - The canvas object representing the fleet
     * @param {boolean} isSelected - Whether the fleet is currently selected
     * @param {boolean} isHovered - Whether the fleet is currently hovered
     */
    setFleetStrokeStyle(fleet, fleetObj, isSelected, isHovered = false) {
        if (isSelected) {
            fleetObj.strokeColor = COLORS.Green
            fleetObj.lineWidth = 3
        } else if (isHovered) {
            fleetObj.strokeColor = COLORS.Cyan
            fleetObj.lineWidth = 2
        } else {
            // All fleets have black stroke by default
            fleetObj.strokeColor = COLORS.Black
            fleetObj.lineWidth = 2
        }
    }


    handleWaypoint() {
        const {cvs, selectedObject} = this.starMap
        const waypointId = 'waypointMarker'
        
        let waypointMarker = cvs.getObject(waypointId)
        
        if (!waypointMarker) {
            waypointMarker = cvs.addFilledTriangle(waypointId, 0, 0, 0, 0, 12, COLORS.Targeting, Math.PI/2)
        }
        
        if (selectedObject && selectedObject.isWaypoint) {
            waypointMarker.visible = true
            waypointMarker.x = selectedObject.x
            waypointMarker.y = selectedObject.y
        } else {
            waypointMarker.visible = false
        }
    }
    
    // Continuous animation loop for waypoint (runs even when paused)
    animateWaypoint() {
        const {cvs} = this.starMap
        const waypointMarker = cvs.getObject('waypointMarker')
        
        if (waypointMarker && waypointMarker.visible) {
            // Oscillate the green color component over time
            const currentMs = Date.now()
            const oscillationFreq = 0.003
            const minGreen = 150
            const maxGreen = 255
            const greenValue = minGreen + (maxGreen - minGreen) * (0.5 + 0.5 * Math.sin(currentMs * oscillationFreq))
            
            waypointMarker.fillColor = [0, greenValue, 0, 1]
        }
        
        // Continue animation loop (runs even when paused)
        requestAnimationFrame(() => this.animateWaypoint())
    }

}
