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
        this.handleFleets()
        this.handleAbandonedFleets()
        this.handleWaypoint()
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
            fleetObj.strokeColor = fleet.planet ? fleet.planet.color : COLORS.White
            fleetObj.lineWidth = 2
        }
    }

    handleFleets() {
        const {starSystem, cvs, selectedObject, selectObject} = this.starMap
        const {fleets} = starSystem

        // Track existing fleet UUIDs
        const existingFleetIds = new Set()
        
        fleets.forEach((fleet, fleetIndex) => {
            existingFleetIds.add(`fleet${fleet.uuid}`)
            existingFleetIds.add(`fleetlabel${fleet.uuid}`)
            existingFleetIds.add(`fleetpath${fleet.uuid}`)
            existingFleetIds.add(`fleetthruster${fleet.uuid}`)
            const fleetId = `fleet${fleet.uuid}`
            const labelId = `fleetlabel${fleet.uuid}`
            const pathId = `fleetpath${fleet.uuid}`
            const thrusterId = `fleetthruster${fleet.uuid}`
            
            let fleetObj = cvs.getObject(fleetId)
            let labelObj = cvs.getObject(labelId)
            let pathObj = cvs.getObject(pathId)
            let thrusterObj = cvs.getObject(thrusterId)
            
            const fleetAngle = fleet.route && fleet.route.path ? fleet.route.path.angle : undefined
            const isPlayerFleet = fleet === gs.fleet
            
            // Create objects if they don't exist
            if (!fleetObj) {
                // Use exponent 0.4 instead of 0.5 (sqrt) to compress larger fleets more (same as planets)
                const fleetSize = Math.pow(fleet.radius/EARTH_RADII_PER_AU, 0.4) * 2.5 * 100
                
                // Use faction color for fill, planet color for stroke
                const fillColor = fleet.factionType ? fleet.factionType.color : (fleet.planet ? fleet.planet.color : COLORS.White)
                const strokeColor = fleet.planet ? fleet.planet.color : COLORS.White
                
                // Use custom polygon shape if flagship has a shape generator
                const flagship = fleet.flagship || (fleet.ships && fleet.ships[0])
                if (flagship && flagship.shipType && flagship.shipType.shapeGenerator) {
                    const shapePolygon = flagship.shipType.shapeGenerator()
                    const vertices = shapePolygon.vertices
                    fleetObj = cvs.addPolygon(fleetId, fleet.x, fleet.y, vertices, fleetSize, 10, fillColor, strokeColor, fleetAngle, () => selectObject.call(this.starMap, fleet))
                } else {
                    fleetObj = cvs.addFilledTriangle(fleetId, fleet.x, fleet.y, fleetSize, fleetSize, 10, fillColor, fleetAngle, () => selectObject.call(this.starMap, fleet))
                    fleetObj.strokeColor = strokeColor
                }
                
                fleetObj.clickPriority = 5 // Fleets have medium priority (lower than planets, higher than default)
                
                pathObj = cvs.addLine(pathId, 0, 0, 0, 0, fillColor, 1)
                thrusterObj = cvs.addFilledTriangle(thrusterId, fleet.x, fleet.y, fleetSize*0.5, fleetSize*0.5, 6, COLORS.Orange)
                labelObj = cvs.addText(labelId, fleet.x, fleet.y, 0, -32, fleet.name, fillColor, DEFAULT_FONT_SIZE, 2, () => selectObject.call(this.starMap, fleet))
                labelObj.clickPriority = 5 // Fleet labels also have medium priority
                
                labelObj.visible = isPlayerFleet
                
                const objs = [fleetObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        labelObj.visible = true
                        this.setFleetStrokeStyle(fleet, fleetObj, fleet == selectedObject, true)
                        labelObj.strokeColor = COLORS.Cyan
                    }
                    obj.onHoverEnd = () => {
                        labelObj.visible = isPlayerFleet
                        this.setFleetStrokeStyle(fleet, fleetObj, fleet == selectedObject, false)
                        labelObj.strokeColor = fleet == selectedObject ? COLORS.Green : (fleet.planet ? fleet.planet.color : COLORS.White)
                    }
                    if (!isPlayerFleet) obj.onHoverEnd()
                }
            }
            
            // Update fleet position and angle
            fleetObj.x = fleet.x
            fleetObj.y = fleet.y
            
            // Smoothly rotate towards target angle instead of snapping
            let isTurning = false
            if (fleetAngle !== undefined) {
                const currentAngle = fleetObj.angle || fleetAngle
                const angleDiff = normalizeAngle(fleetAngle - currentAngle)
                const rotationSpeed = Math.PI / 60 // Rotate up to ~3 degrees per frame (2x slower)
                
                if (Math.abs(angleDiff) < rotationSpeed) {
                    fleetObj.angle = fleetAngle // Close enough, snap to target
                } else {
                    fleetObj.angle = currentAngle + Math.sign(angleDiff) * rotationSpeed
                    isTurning = true
                }
            }
            
            // Update stroke style based on selection
            this.setFleetStrokeStyle(fleet, fleetObj, fleet == selectedObject)
            
            // Oscillate brightness dramatically using alpha channel
            const currentMs = Date.now()
            const brightnessOscillation = 0.3 * Math.sin(currentMs * 0.002 + fleetIndex) // Dramatic brightness variation
            const baseAlpha = 1-(fleet.cloakLevel*0.95)
            fleetObj.fillColor[3] = Math.max(0.3, Math.min(1, baseAlpha + brightnessOscillation))
            
            // Update onClick handler - docked fleets should not be clickable
            fleetObj.onClick = fleet.location ? null : () => selectObject.call(this.starMap, fleet)
            
            // Update label
            if (fleet.location || !fleet.route) {
                labelObj.visible = false
            } else {
                labelObj.visible = isPlayerFleet
                labelObj.x = fleet.x
                labelObj.y = fleet.y
            }
            
            // Update path (only show for player fleet or selected fleet)
            const shouldShowPath = (fleet === gs.fleet || fleet === selectedObject) && fleet.route && fleet.route.path
            if (!shouldShowPath) {
                pathObj.visible = false
            } else {
                let {startX, startY, toX, toY} = fleet.route.path
                pathObj.visible = true
                pathObj.x = startX
                pathObj.y = startY
                pathObj.x2 = toX
                pathObj.y2 = toY
            }
            
            // Update thruster
            if (fleet.location || !fleet.route || isTurning) {
                thrusterObj.visible = false
            } else {
                // Position thruster behind fleet, offset by fleet size + small gap
                const thrusterOffset = 15
                const [screenOffsetX, screenOffsetY] = rotatePoint(thrusterOffset, 0, 0, 0, fleetAngle - Math.PI)
                if (fleetAngle !== undefined) thrusterObj.angle = fleetAngle - Math.PI
                thrusterObj.visible = true
                thrusterObj.x = fleet.x
                thrusterObj.y = fleet.y
                thrusterObj.screenOffsetX = screenOffsetX
                thrusterObj.screenOffsetY = screenOffsetY
                
                // Oscillate thruster transparency and size
                const currentMs = Date.now()
                const oscillationFreq = 0.003 // Slower oscillation for fleet thrusters
                const baseAlpha = 1 - (fleet.cloakLevel * 0.95)
                const alphaOscillation = 0.1 * Math.sin(currentMs * oscillationFreq)
                thrusterObj.fillColor[3] = Math.min(1, baseAlpha + alphaOscillation)
                
                // Oscillate size slightly
                const fleetSize = Math.pow(fleet.radius/EARTH_RADII_PER_AU, 0.4) * 2.5 * 100
                const sizeOscillation = 1 + 0.15 * Math.sin(currentMs * 0.004)
                thrusterObj.size = fleetSize * 0.5 * sizeOscillation
                thrusterObj.minorSize = fleetSize * 0.5 * sizeOscillation
            }
        })
        
        // Remove canvas objects for fleets that no longer exist
        for (const [id, obj] of cvs.objectMap.entries()) {
            if ((id.startsWith('fleet') || id.startsWith('fleetthruster') || id.startsWith('fleetpath') || id.startsWith('fleetlabel')) && !existingFleetIds.has(id)) {
                cvs.deleteObject(id)
            }
        }
    }

    handleAbandonedFleets() {
        const {starSystem, cvs, selectedObject, selectObject} = this.starMap
        const {abandonedFleets} = starSystem

        // Track existing abandoned fleet UUIDs
        const existingAbandonedFleetIds = new Set()
        
        abandonedFleets.forEach((fleet) => {
            existingAbandonedFleetIds.add(`abandonedfleet${fleet.uuid}`)
            existingAbandonedFleetIds.add(`abandonedfleetlabel${fleet.uuid}`)
            existingAbandonedFleetIds.add(`abandonedfleetpath${fleet.uuid}`)
            const fleetId = `abandonedfleet${fleet.uuid}`
            const labelId = `abandonedfleetlabel${fleet.uuid}`
            const pathId = `abandonedfleetpath${fleet.uuid}`
            
            let fleetObj = cvs.getObject(fleetId)
            let labelObj = cvs.getObject(labelId)
            let pathObj = cvs.getObject(pathId)
            
            const fleetAngle = fleet.angle
            
            // Create objects if they don't exist
            if (!fleetObj) {
                // Use exponent 0.4 instead of 0.5 (sqrt) to compress larger fleets more (same as planets)
                const fleetSize = Math.pow(fleet.radius/EARTH_RADII_PER_AU, 0.4) * 2.5
                
                // Use faction color for fill, planet color for stroke
                const fillColor = fleet.factionType ? fleet.factionType.color : (fleet.planet ? fleet.planet.color : COLORS.White)
                const strokeColor = fleet.planet ? fleet.planet.color : COLORS.White
                
                // Use custom polygon shape if flagship has a shape generator
                const flagship = fleet.flagship || (fleet.ships && fleet.ships[0])
                if (flagship && flagship.shipType && flagship.shipType.shapeGenerator) {
                    const shapePolygon = flagship.shipType.shapeGenerator()
                    const vertices = shapePolygon.vertices
                    fleetObj = cvs.addPolygon(fleetId, fleet.x, fleet.y, vertices, fleetSize, 12, fillColor, strokeColor, fleetAngle, () => selectObject.call(this.starMap, fleet))
                } else {
                    fleetObj = cvs.addFilledTriangle(fleetId, fleet.x, fleet.y, fleetSize, fleetSize, 12, fillColor, fleetAngle, () => selectObject.call(this.starMap, fleet))
                    fleetObj.strokeColor = strokeColor
                }
                
                fleetObj.clickPriority = 5 // Fleets have medium priority (lower than planets, higher than default)
                
                pathObj = cvs.addLine(pathId, 0, 0, 0, 0, fillColor, 1)
                labelObj = cvs.addText(labelId, fleet.x, fleet.y, 0, -32, fleet.name + ' (Abandoned)', fillColor, DEFAULT_FONT_SIZE, 2, () => selectObject.call(this.starMap, fleet))
                labelObj.clickPriority = 5 // Fleet labels also have medium priority
                
                const objs = [fleetObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        labelObj.visible = true
                        this.setFleetStrokeStyle(fleet, fleetObj, fleet == selectedObject, true)
                        labelObj.strokeColor = COLORS.Cyan
                    }
                    obj.onHoverEnd = () => {
                        labelObj.visible = false
                        this.setFleetStrokeStyle(fleet, fleetObj, fleet == selectedObject, false)
                        labelObj.strokeColor = fleet == selectedObject ? COLORS.Green : (fleet.planet ? fleet.planet.color : COLORS.White)
                    }
                    obj.onHoverEnd()
                }
            }
            
            // Update fleet position and angle
            fleetObj.x = fleet.x
            fleetObj.y = fleet.y
            if (fleetAngle !== undefined) fleetObj.angle = fleetAngle
            
            // Update stroke style based on selection
            this.setFleetStrokeStyle(fleet, fleetObj, fleet == selectedObject)
            
            fleetObj.fillColor[3] = 0.5 // Dimmed appearance
            
            // Update label
            labelObj.x = fleet.x
            labelObj.y = fleet.y
            labelObj.fillColor[3] = 0.7
            
            // No path for abandoned fleets
            pathObj.visible = false
        })
        
        // Remove canvas objects for abandoned fleets that no longer exist
        for (const [id, obj] of cvs.objectMap.entries()) {
            if ((id.startsWith('abandonedfleet') || id.startsWith('abandonedfleetpath') || id.startsWith('abandonedfleetlabel')) && !existingAbandonedFleetIds.has(id)) {
                cvs.deleteObject(id)
            }
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
    }

    /**
     * Update AI references to the starMap after deserialization
     * (May be needed if fleet AIs reference starMap methods)
     */
    updateFleetAIReferences() {
        const {starSystem} = this.starMap
        const {fleets} = starSystem
        
        fleets.forEach(fleet => {
            if (fleet.fleetAI) {
                fleet.fleetAI.starMap = this.starMap
            }
        })
    }
}
