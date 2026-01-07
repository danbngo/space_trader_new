/**
 * Handles rendering of ships, effects, and animations on the EncounterMap
 */
class EncounterMapRenderer {
    /**
     * @param {EncounterMap} encounterMap - Reference to the parent EncounterMap instance
     */
    constructor(encounterMap) {
        this.encounterMap = encounterMap
        this.cvs = encounterMap.cvs
        this.encounter = encounterMap.encounter
    }

    /**
     * Add a visual effect to the canvas
     */
    addEffectCanvasObject(effect) {
        const {cvs} = this
        const id = `effect${effect.uuid}`
        
        if (effect.effectType.shape == SHAPES.FilledOval) {
            cvs.addFilledOval(id, effect.x, effect.y, effect.radius, effect.radius * 0.5, 0.5, effect.effectType.color, effect.angle)
        }
        else if (effect.effectType.shape == SHAPES.FilledRectangle) {
            cvs.addFilledRectangle(id, effect.x, effect.y, effect.path.distance, effect.radius, 8, effect.effectType.color, effect.angle)
        }
        else if (effect.effectType.shape == SHAPES.FilledCircle) {
            cvs.addFilledCircle(id, effect.x, effect.y, effect.radius, 8, effect.effectType.color)
        }
    }

    /**
     * Calculate stroke color for a ship based on its state
     */
    calcStrokeColorForObj(ship) {
        if (ship == this.encounterMap.selectedObject) return COLORS.Green
        if (this.encounterMap.validTargets.includes(ship)) return COLORS.Yellow
        if (ship.disabled) return COLORS.Gray
        if (ship.fleet == this.encounter.activeTurnFleet) return COLORS.Yellow
        if (ship.fleet == this.encounter.playerFleet) return COLORS.Cyan
        return COLORS.Red
    }

    /**
     * Main refresh method for ships and effects
     */
    refreshCanvas(forceRedraw = false) {
        const {encounter, cvs, fadeOutProgress} = this.encounterMap
        const {ships, activeTurnFleet, effects} = encounter

        const now = Date.now()
        
        // Track existing ship UUIDs
        const existingShipIds = new Set()

        // Draw ships
        ships.forEach((ship, index) => {
            const shipId = `ship${ship.uuid}`
            
            // Handle fade-out for escaped ships
            if (ship.escaped) {
                if (!fadeOutProgress.has(shipId)) {
                    fadeOutProgress.set(shipId, 1.0) // Start at full opacity
                }
                // Decrease fade progress (fade out over ~1 second at 60fps)
                let fadeProgress = fadeOutProgress.get(shipId)
                fadeProgress -= 0.016 // Decrease by ~1/60 per frame
                fadeOutProgress.set(shipId, Math.max(0, fadeProgress))
            } else {
                // Ship is not escaped, ensure it's not in fade-out map
                fadeOutProgress.delete(shipId)
            }
            
            const fadeProgress = fadeOutProgress.get(shipId) ?? 1.0
            let invisible = fadeProgress <= 0 // Only invisible when fade completes
            if (ship.aiType == AI_TYPES.Asteroid && ship.disabled) invisible = true

            existingShipIds.add(shipId)
            existingShipIds.add(shipId+'shield')
            existingShipIds.add(shipId+'label')
            existingShipIds.add(shipId+'thruster')
            
            let cvsShipObject = cvs.getObject(shipId)
            
            // Create ship canvas objects if they don't exist (for dynamically added ships)
            if (!cvsShipObject) {
                console.log('dynamically adding new ship to canvas:', shipId, ship)
                
                // Determine stroke color based on fleet's cloakLevel
                const strokeColor = (ship.fleet && ship.fleet.cloakLevel > 0) ? null : COLORS.White
                const asteroidStrokeColor = (ship.fleet && ship.fleet.cloakLevel > 0) ? null : COLORS.Gray
                
                // Special handling for asteroids - use polygon shape
                if (ship instanceof AsteroidShip) {
                    if (!ship.asteroidVertices) {
                        ship.asteroidVertices = AsteroidShip.generateShape()
                    }
                    cvsShipObject = cvs.addPolygon(shipId, ship.x, ship.y, ship.asteroidVertices, ship.radius, 12, ship.color, asteroidStrokeColor, ship.angle, () => this.encounterMap.selectObject(ship))
                }
                // Use custom polygon shape if ship type has a shape generator
                else if (ship.shipType.shapeGenerator) {
                    const shapePolygon = ship.shipType.shapeGenerator()
                    const vertices = shapePolygon.vertices
                    cvsShipObject = cvs.addPolygon(shipId, ship.x, ship.y, vertices, ship.radius, 12, ship.color, strokeColor, ship.angle, () => this.encounterMap.selectObject(ship))
                }
                // Fallback to legacy shapes
                else if (ship.shipType.shape == SHAPES.FilledTriangle) {
                    cvsShipObject = cvs.addFilledTriangle(shipId, ship.x, ship.y, ship.radius, ship.radius, 12, ship.color, ship.angle, () => this.encounterMap.selectObject(ship))
                }
                else if (ship.shipType.shape == SHAPES.FilledOval) {
                    cvsShipObject = cvs.addFilledOval(shipId, ship.x, ship.y, ship.radius, ship.radius * (ship instanceof AsteroidShip ? ship.widthModifier : 1), 0.5, ship.color, ship.angle, () => this.encounterMap.selectObject(ship))
                }
                else if (ship.shipType.shape == SHAPES.FilledCircle) {
                    cvsShipObject = cvs.addFilledCircle(shipId, ship.x, ship.y, ship.radius, 12, ship.color, () => this.encounterMap.selectObject(ship))
                }
                else {
                    console.error('Cannot create ship canvas object - invalid shape:', ship.shipType.shape)
                    return
                }
                
                cvsShipObject.onHover = () => this.encounterMap.hoverObject(ship)
                cvs.addEmptyCircle(shipId+'shield', ship.x, ship.y, ship.radius*1.1, 10, COLORS.Blue, 1)
                const labelObj = cvs.addText(shipId+'label', ship.x, ship.y, 0, -32, ship.shipType.name, ship.color, DEFAULT_FONT_SIZE, 2, () => this.encounterMap.selectObject(ship))
                labelObj.onHover = () => this.encounterMap.hoverObject(ship)
                const objs = [cvsShipObject, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        labelObj.visible = true
                        for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                    }
                    obj.onHoverEnd = () => {
                        labelObj.visible = false
                        for (const obj3 of objs) obj3.strokeColor = this.calcStrokeColorForObj(ship)
                    }
                    obj.onHoverEnd()
                }
                const thrusterColor = ship.aiType == AI_TYPES.Asteroid ? COLORS.Green : COLORS.Orange
                cvs.addFilledTriangle(shipId+'thruster', ship.x, ship.y, ship.radius*0.5, ship.radius*0.5, 6, thrusterColor, ship.angle - Math.PI)
                
                cvs.recalculateDrawOrder()
            }
            
            if (!cvsShipObject) {
                return
            }
            const cvsShieldObject = cvs.getObject(shipId+'shield')
            const cvsLabelObject = cvs.getObject(shipId+'label')
            const cvsThrusterObject = cvs.getObject(shipId+'thruster')

            let cloaked = false

            // Display cloaked ships as white with low alpha
            if (ship.statusEffects.has(STATUS_EFFECTS.CLOAKED)) {
                if (ship.fleet != encounter.playerFleet) {
                    invisible = true // enemy ships will be invisible
                }
                else cloaked = true
            }

            if (invisible) {
                cvsShipObject.visible = false
                cvsShieldObject.visible = false
                cvsLabelObject.visible = false
                cvsThrusterObject.visible = false
                return
            }

            const shieldsRatio = ship.shields[0] <= 0 ? 0 : 0.25+(0.75*ship.shields[0]/ship.shields[1])
            const hullRatio = 0.25 + (0.75*ship.hull[0]/ship.hull[1])

            // Smooth interpolation for position and angle
            const interpSpeed = 0.15
            const positionThreshold = 0.5
            const angleThreshold = 0.05
            
            // Smooth position interpolation
            const dx = ship.x - cvsShipObject.x
            const dy = ship.y - cvsShipObject.y
            const distance = Math.sqrt(dx*dx + dy*dy)
            
            if (distance > positionThreshold) {
                cvsShipObject.x += dx * interpSpeed
                cvsShipObject.y += dy * interpSpeed
            } else {
                cvsShipObject.x = ship.x
                cvsShipObject.y = ship.y
            }
            
            // Smooth angle interpolation
            const targetAngle = ship.angle
            let angleDiff = targetAngle - cvsShipObject.angle
            // Normalize angle difference to [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI
            
            if (Math.abs(angleDiff) > angleThreshold) {
                cvsShipObject.angle += angleDiff * interpSpeed
            } else {
                cvsShipObject.angle = targetAngle
            }
            
            // Display cloaked ships as white with low alpha
            if (cloaked) {
                cvsShipObject.fillColor[3] = 0.1 * fadeProgress
            } else {
                cvsShipObject.fillColor[3] = hullRatio * fadeProgress
            }
            
            cvsShieldObject.x = cvsShipObject.x
            cvsShieldObject.y = cvsShipObject.y
            cvsShieldObject.strokeColor[3] = shieldsRatio * fadeProgress
            cvsShieldObject.fillColor[3] = shieldsRatio * fadeProgress

            cvsLabelObject.x = cvsShipObject.x
            cvsLabelObject.y = cvsShipObject.y

            if (ship.aiType !== AI_TYPES.Asteroid) {
                // Position thruster behind ship
                const thrusterOffset = ship.radius * 1.3
                const [xo, yo] = rotatePoint(thrusterOffset, 0, 0, 0, cvsShipObject.angle-Math.PI)
                cvsThrusterObject.x = cvsShipObject.x+xo
                cvsThrusterObject.y = cvsShipObject.y+yo
                cvsThrusterObject.screenOffsetX = 0
                cvsThrusterObject.screenOffsetY = 0
                cvsThrusterObject.angle = cvsShipObject.angle - Math.PI
            }
            else cvsThrusterObject.visible = false
            
            // Oscillate thruster alpha and size based on engine speed
            const currentMs = Date.now()
            const engineSpeed = ship.engine / AVERAGE_SHIP_ENGINE
            const oscillationFreq = 0.005 * (0.005 + engineSpeed)
            const alpha = 0.9 + 0.1 * Math.sin(currentMs * oscillationFreq)
            cvsThrusterObject.fillColor[3] = alpha * fadeProgress
            
            // Oscillate thruster size
            const baseThrusterSize = ship.radius * 0.5
            const sizeOscillation = 1 + 0.2 * Math.sin(currentMs * 0.004)
            cvsThrusterObject.size = baseThrusterSize * sizeOscillation
            cvsThrusterObject.minorSize = baseThrusterSize * sizeOscillation

            let fontModifier = null
            if (ship.disabled) {
                fontModifier = 'italic'
                cvsLabelObject.fillColor[3] = 0.5 * fadeProgress
            }
            else if (ship.fleet != activeTurnFleet) {
                fontModifier = 'italic'
                cvsLabelObject.fillColor[3] = 1.0 * fadeProgress
            }
            else {
                if (ship.actionsRemaining == 0) fontModifier = null
                else fontModifier = 'bold'
                cvsLabelObject.fillColor[3] = 1.0 * fadeProgress
            }
            cvsLabelObject.fontModifier = fontModifier
        })

        // Draw effects
        effects.forEach((effect, index) => {
            const cvsEffectObject = cvs.getObject(`effect${effect.uuid}`)
            if (!cvsEffectObject) {
                this.addEffectCanvasObject(effect)
                return
            }
            if (effect.effectType.shape == SHAPES.FilledOval) {
                cvsEffectObject.x = effect.x
                cvsEffectObject.y = effect.y
                cvsEffectObject.angle = effect.angle
                cvsEffectObject.minorSize = effect.radius * 0.5
                cvsEffectObject.size = effect.radius
            }
            else if (effect.effectType.shape == SHAPES.FilledRectangle) {
                cvsEffectObject.minorSize = effect.radius
            }

            // Oscillate effect alpha
            const currentMs = Date.now()
            const radiusSpeed = effect.radius / 10
            const oscillationFreq = 0.001 * (0.001 + radiusSpeed)
            const alpha = 0.3 + (0.05 * Math.sin(currentMs * oscillationFreq))
            cvsEffectObject.fillColor[3] = alpha
        })

        // Remove canvas objects for effects that no longer exist
        const activeEffectIds = new Set(effects.map(e => `effect${e.uuid}`))
        const allCanvasObjects = Array.from(cvs.objectMap.keys())
        for (const objId of allCanvasObjects) {
            if (objId.startsWith('effect') && !activeEffectIds.has(objId)) {
                cvs.deleteObject(objId)
            }
        }
        
        // Remove canvas objects for ships that no longer exist
        for (const objId of allCanvasObjects) {
            if (objId.startsWith('ship') && !existingShipIds.has(objId)) {
                cvs.deleteObject(objId)
            }
        }

        this.encounterMap.handleAnimations(now)

        cvs.redraw(forceRedraw)
    }

    /**
     * Refresh stroke colors for all ships
     */
    refreshStrokeColors() {
        const {encounter, cvs} = this.encounterMap
        const {ships} = encounter

        ships.forEach(ship => {
            const cvsShipObject = cvs.getObject(`ship${ship.uuid}`)
            if (!cvsShipObject) return
            cvsShipObject.strokeColor = this.calcStrokeColorForObj(ship)
        })
    }
}
