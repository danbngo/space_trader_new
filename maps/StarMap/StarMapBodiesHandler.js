/**
 * Handles rendering of celestial bodies (stars, planets, space stations, asteroids, anomalies, ruins) on the star map
 */
class StarMapBodiesHandler {
    /**
     * @param {StarMap} starMap - Reference to the parent StarMap instance
     */
    constructor(starMap) {
        this.starMap = starMap
        this.cvs = starMap.cvs
        this.starSystem = starMap.starSystem
    }

    handleAll() {
        this.handleBackgroundStars()
        this.handleAsteroids()
        this.handleOrbits()
        // Vision circle removed - too jarring
        // this.handleViewDistanceCircle()
        this.handleStars()
        this.handlePlanets()
        this.handleSpaceStations()
        this.handleAnomalies()
        this.handleRuins()
    }

    handleBackgroundStars() {
        const {starSystem, cvs} = this.starMap
        const {backgroundStars} = starSystem
        
        const sizeOffset = Math.max(cvs.canvas.width, cvs.canvas.height)/SOLAR_SYSTEM_RADIUS_IN_AU * 4
        backgroundStars.forEach((bgStar, index) => {
            bgStar.twinkle(gs.year)
            if (!cvs.pixels[index]) {
                cvs.addPixel(0, 0, bgStar.color, bgStar.radius, bgStar.x * sizeOffset, bgStar.y * sizeOffset, true)
            }
            
            /** @type {CanvasPixel} */
            const pixel = cvs.pixels[index]
            
            // Check if background star is within player's vision circle on screen
            if (gs.fleet && gs.fleet.mapViewDistance) {
                // Get player's screen position
                const fleetScreenPos = cvs.worldToScreen(gs.fleet.x, gs.fleet.y)
                
                // Calculate vision radius in screen pixels
                const visionRadiusScreen = gs.fleet.mapViewDistance * cvs.zoom / cvs.pixelRatio
                
                const screenDistance = calcDistance(pixel.screenOffsetX, pixel.screenOffsetY, fleetScreenPos[0], fleetScreenPos[1])
                
                if (screenDistance > visionRadiusScreen) {
                    pixel.color[3] = bgStar.color[3]*0.25// Dim the star when outside vision range
                } else {
                    pixel.color[3] = bgStar.color[3]*1 // Full brightness within vision range
                }
            }
        })
    }

    handleAsteroids() {
        const {starSystem, cvs} = this.starMap
        const {backgroundStars, asteroids} = starSystem
        const numBackgroundStars = backgroundStars.length
        
        asteroids.forEach((asteroid, index) => {
            const pixelIndex = numBackgroundStars + index
            if (!cvs.pixels[pixelIndex]) {
                cvs.addPixel(asteroid.x, asteroid.y, asteroid.color, asteroid.radius)
            }
            /** @type {CanvasPixel} */
            const pixel = cvs.pixels[pixelIndex]
            pixel.x = asteroid.x
            pixel.y = asteroid.y
            
            // Check if within player's vision range
            if (gs.fleet && gs.fleet.mapViewDistance) {
                const distance = calcDistance(asteroid.x, asteroid.y, gs.fleet.x, gs.fleet.y)
                
                if (distance > gs.fleet.mapViewDistance) {
                    //pixel.visible = false // Hide outside vision range
                    pixel.color[3] = 64
                } else {
                    //pixel.visible = true
                    pixel.color[3] = 255
                }
            } 
        })
    }

    handleOrbits() {
        const {starSystem, cvs} = this.starMap
        const {stars, planets, dwarfPlanets} = starSystem
        const allPlanets = [...planets, ...dwarfPlanets]
        const orbitingBodies = [...stars, ...allPlanets].filter(b => b.orbit)

        orbitingBodies.forEach((orbitingBody) => {
            const id = `orbit${orbitingBody.uuid}`
            let cvsObject = cvs.getObject(id)
            
            if (!cvsObject) {
                cvsObject = cvs.addEmptyCircle(id, orbitingBody.parent.x, orbitingBody.parent.y, orbitingBody.orbit.radius, 1, orbitingBody.color, 0.25)
            }
            
            cvsObject.x = orbitingBody.parent.x
            cvsObject.y = orbitingBody.parent.y
        })
    }

    handleViewDistanceCircle() {
        const {cvs} = this.starMap
        const viewDistanceId = 'playerViewDistance'
        
        if (!gs.fleet || !gs.fleet.x || !gs.fleet.y) {
            // Hide circle if player fleet doesn't exist or isn't positioned
            const circle = cvs.getObject(viewDistanceId)
            if (circle) circle.visible = false
            return
        }
        
        let circle = cvs.getObject(viewDistanceId)
        
        if (!circle) {
            // Create the view distance circle with subtle alpha
            circle = cvs.addEmptyCircle(viewDistanceId, gs.fleet.x, gs.fleet.y, gs.fleet.mapViewDistance, 1, COLORS.Cyan, 0.33)
        }
        
        // Update position and radius
        circle.visible = true
        circle.x = gs.fleet.x
        circle.y = gs.fleet.y
        circle.radius = gs.fleet.mapViewDistance
    }

    handleStars() {
        const {starSystem, cvs, selectedObject, selectObject} = this.starMap
        const {stars} = starSystem

        stars.forEach((body) => {
            const id = `star${body.uuid}`
            const unknownId = `unknown${body.uuid}`
            let cvsObject = cvs.getObject(id)
            let unknownObj = cvs.getObject(unknownId)
            
            // Check if discovered
            const hasBeenSeen = gs.lastSeenDates.has(body)
            const isInVisionRange = gs.fleet && gs.fleet.mapViewDistance && 
                calcDistance(body.x, body.y, gs.fleet.x, gs.fleet.y) <= gs.fleet.mapViewDistance
            
            if (!cvsObject) {
                const displaySize = Math.sqrt(body.radius/EARTH_RADII_PER_AU) * 3
                cvsObject = cvs.addFilledCircle(id, body.x, body.y, displaySize, SUN_MIN_SCREEN_SIZE, body.color, () => selectObject.call(this.starMap, body))
            }
            
            // Create unknown marker circle (no question mark)
            if (!unknownObj) {
                unknownObj = cvs.addEmptyCircle(unknownId, body.x, body.y, 0.5, 2, COLORS.White, 1, () => selectObject.call(this.starMap, body))
                unknownObj.clickPriority = 12
            }
            
            // Show star only if discovered or in vision range
            const isDiscovered = hasBeenSeen || isInVisionRange
            cvsObject.visible = isDiscovered
            unknownObj.visible = !hasBeenSeen // Show unknown circle for all unseen stars
            
            cvsObject.x = body.x
            cvsObject.y = body.y
            unknownObj.x = body.x
            unknownObj.y = body.y
            
            cvsObject.strokeColor = (body == selectedObject) ? COLORS.Green : COLORS.Black
        })
    }

    handlePlanets() {
        const {starSystem, cvs, selectedObject, selectObject} = this.starMap
        const {planets, dwarfPlanets} = starSystem
        const allPlanets = [...planets, ...dwarfPlanets]

        allPlanets.forEach((body) => {
            const planetId = `planet${body.uuid}`
            const labelId = `planetlabel${body.uuid}`
            const nightSideId = `planetnightside${body.uuid}`
            const unknownId = `unknown${body.uuid}`
            
            let planetObj = cvs.getObject(planetId)
            let labelObj = cvs.getObject(labelId)
            let nightSideObj = cvs.getObject(nightSideId)
            let unknownObj = cvs.getObject(unknownId)
            
            // Check if discovered
            const hasBeenSeen = gs.lastSeenDates.has(body)
            const isInVisionRange = gs.fleet && gs.fleet.mapViewDistance && 
                calcDistance(body.x, body.y, gs.fleet.x, gs.fleet.y) <= gs.fleet.mapViewDistance
            
            // Create objects if they don't exist
            if (!planetObj) {
                const minScreenSize = body.objectType == OBJECT_TYPES.DWARF_PLANET ? DWARF_PLANET_MIN_SCREEN_SIZE : PLANET_MIN_SCREEN_SIZE
                const displaySize = Math.pow(body.radius/EARTH_RADII_PER_AU, 0.4) * 3.5
                planetObj = cvs.addFilledCircle(planetId, body.x, body.y, displaySize, minScreenSize, body.color, () => selectObject.call(this.starMap, body))
                planetObj.clickPriority = 10
                
                // Create night side overlay as a crescent/gibbous shape
                const crescentVertices = []
                const numPoints = 25
                const terminatorOffset = 0.15 // Reduced from 0.25 for less shadow overlap
                
                for (let i = 0; i <= numPoints; i++) {
                    const angle = Math.PI * i / numPoints - Math.PI / 2
                    const x = Math.cos(angle)
                    const y = Math.sin(angle)
                    crescentVertices.push([x, y])
                }
                
                for (let i = numPoints; i >= 0; i--) {
                    const angle = Math.PI * i / numPoints - Math.PI / 2
                    const x = Math.cos(angle) * terminatorOffset - terminatorOffset
                    const y = Math.sin(angle)
                    crescentVertices.push([x, y])
                }
                
                const nightColor = [0, 0, 0, 0.7]
                nightSideObj = cvs.addPolygon(nightSideId, body.x, body.y, crescentVertices, displaySize, minScreenSize, nightColor, null, 0, null, 11)
                
                labelObj = cvs.addText(labelId, body.x, body.y, 0, -32, body.name, body.color, DEFAULT_FONT_SIZE, 2, () => selectObject.call(this.starMap, body))
                labelObj.clickPriority = 10
                labelObj.visible = false // Start hidden
                
                const objs = [planetObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        // Show Unknown if not visited
                        const hasBeenVisited = gs.lastVisitedDates.has(body)
                        labelObj.textContent = hasBeenVisited ? body.name : `Unknown ${body.objectType.name}`
                        labelObj.visible = true
                        for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                    }
                    obj.onHoverEnd = () => {
                        labelObj.visible = false
                        for (const obj3 of objs) obj3.strokeColor = (body == selectedObject) ? COLORS.Green : COLORS.Black
                    }
                    obj.onHoverEnd()
                }
            }
            
            // Create unknown marker circle (no question mark)
            if (!unknownObj) {
                unknownObj = cvs.addEmptyCircle(unknownId, body.x, body.y, 0.3, 2, COLORS.White, 1, () => selectObject.call(this.starMap, body))
                unknownObj.clickPriority = 12
            }
            
            // Show planet only if discovered or in vision range
            const isDiscovered = hasBeenSeen || isInVisionRange
            planetObj.visible = isDiscovered
            labelObj.visible = false
            nightSideObj.visible = isDiscovered
            unknownObj.visible = !hasBeenSeen // Show unknown circle for all unseen planets
            
            // Dim planet when outside vision range (like asteroids)
            if (isDiscovered) {
                if (isInVisionRange) {
                    planetObj.fillColor[3] = 1.0 // Full brightness
                } else {
                    planetObj.fillColor[3] = 0.25 // Dimmed (64/255 = 0.25)
                }
            }
            
            // Update positions
            planetObj.x = body.x
            planetObj.y = body.y
            labelObj.x = body.x
            labelObj.y = body.y
            unknownObj.x = body.x
            unknownObj.y = body.y
            
            // Update nightside position and angle only when planet is visible
            if (isDiscovered && nightSideObj && body.orbit) {
                nightSideObj.x = body.x
                nightSideObj.y = body.y
                const angleToSun = calcAngleTowardsPoint(body.x, body.y, body.parent.x, body.parent.y)
                nightSideObj.angle = angleToSun + Math.PI
            }
            
            if (body == selectedObject) {
                planetObj.strokeColor = COLORS.Green
                labelObj.strokeColor = COLORS.Green
            }
        })
    }

    handleSpaceStations() {
        const {starSystem, cvs, selectedObject, selectObject} = this.starMap
        const {spaceStations} = starSystem
        
        if (!spaceStations) return

        spaceStations.forEach((station) => {
            const stationId = `station${station.uuid}`
            const labelId = `stationlabel${station.uuid}`
            const unknownId = `unknown${station.uuid}`
            
            let stationObj = cvs.getObject(stationId)
            let labelObj = cvs.getObject(labelId)
            let unknownObj = cvs.getObject(unknownId)
            
            // Check if discovered
            const hasBeenSeen = gs.lastSeenDates.has(station)
            const isInVisionRange = gs.fleet && gs.fleet.mapViewDistance && 
                calcDistance(station.x, station.y, gs.fleet.x, gs.fleet.y) <= gs.fleet.mapViewDistance
             
            if (!stationObj) {
                stationObj = cvs.addFilledRectangle(stationId, station.x, station.y, station.radius * 16, station.radius * 16, SPACE_STATION_MIN_SCREEN_SIZE, station.color, 0, () => selectObject.call(this.starMap, station))
                
                labelObj = cvs.addText(labelId, station.x, station.y, 0, -24, station.name, station.color, DEFAULT_FONT_SIZE, 2, () => selectObject.call(this.starMap, station))
                
                const objs = [stationObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        // Show Unknown Station if not visited
                        const hasBeenVisited = gs.lastVisitedDates.has(station)
                        labelObj.textContent = hasBeenVisited ? station.name : 'Unknown Station'
                        labelObj.visible = true
                        for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                    }
                    obj.onHoverEnd = () => {
                        labelObj.visible = false
                        for (const obj3 of objs) obj3.strokeColor = (station == selectedObject) ? COLORS.Green : COLORS.Black
                    }
                    obj.onHoverEnd()
                }
            }
            
            // Create unknown marker circle (no question mark)
            if (!unknownObj) {
                unknownObj = cvs.addEmptyCircle(unknownId, station.x, station.y, 0.2, 2, COLORS.White, 1, () => selectObject.call(this.starMap, station))
                unknownObj.clickPriority = 12
            }
            
            // Show station only if discovered or in vision range
            const isDiscovered = hasBeenSeen || isInVisionRange
            stationObj.visible = isDiscovered
            labelObj.visible = false
            unknownObj.visible = !hasBeenSeen // Show unknown circle for all unseen stations
            
            // Update positions
            stationObj.x = station.x
            stationObj.y = station.y
            labelObj.x = station.x
            labelObj.y = station.y
            unknownObj.x = station.x
            unknownObj.y = station.y
            
            // Update stroke color
            if (isDiscovered && station == selectedObject) {
                stationObj.strokeColor = COLORS.Green
                labelObj.strokeColor = COLORS.Green
            }
        })
    }

    handleAnomalies() {
        const {starSystem, cvs, selectedObject, selectObject} = this.starMap
        const {anomalies} = starSystem
        
        if (!anomalies) return
        
        const existingAnomalyIds = new Set()
        
        anomalies.forEach((anomaly) => {
            // Check if discovered or in vision range
            const hasBeenSeen = gs.lastSeenDates.has(anomaly)
            const isInVisionRange = gs.fleet && gs.fleet.mapViewDistance && 
                calcDistance(anomaly.x, anomaly.y, gs.fleet.x, gs.fleet.y) <= gs.fleet.mapViewDistance
            const isVisible = (hasBeenSeen || isInVisionRange) && anomaly.detectable(gs.fleet)
            
            existingAnomalyIds.add(`anomaly${anomaly.uuid}`)
            existingAnomalyIds.add(`anomalylabel${anomaly.uuid}`)
            const anomalyId = `anomaly${anomaly.uuid}`
            const labelId = `anomalylabel${anomaly.uuid}`
            
            let anomalyObj = cvs.getObject(anomalyId)
            let labelObj = cvs.getObject(labelId)
            
            if (!anomalyObj) {
                anomalyObj = cvs.addEmptyCircle(anomalyId, anomaly.x, anomaly.y, anomaly.radius * 10, 2, anomaly.color, 1, () => selectObject.call(this.starMap, anomaly))
                labelObj = cvs.addText(labelId, anomaly.x, anomaly.y, 0, -24, anomaly.name, anomaly.color, DEFAULT_FONT_SIZE, 2, () => selectObject.call(this.starMap, anomaly))
                labelObj.visible = false
                
                const objs = [anomalyObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        if (!anomaly.detectable(gs.fleet)) return
                        labelObj.visible = true
                        for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                    }
                    obj.onEndHover = () => {
                        labelObj.visible = false
                        if (anomaly === selectedObject) {
                            for (const obj2 of objs) obj2.strokeColor = COLORS.Green
                        } else {
                            for (const obj2 of objs) obj2.strokeColor = undefined
                        }
                    }
                }
            }
            
            anomalyObj.x = anomaly.x
            anomalyObj.y = anomaly.y
            labelObj.x = anomaly.x
            labelObj.y = anomaly.y
            
            anomalyObj.visible = isVisible
            if (!isVisible) {
                labelObj.visible = false
            }
            
            if (anomaly == selectedObject) {
                anomalyObj.strokeColor = COLORS.Green
                labelObj.strokeColor = COLORS.Green
                labelObj.visible = isVisible
            } else if (!labelObj.visible) {
                anomalyObj.strokeColor = undefined
                labelObj.strokeColor = undefined
            }
        })
        
        for (const [id, obj] of cvs.objectMap.entries()) {
            if (id.startsWith('anomaly') && !existingAnomalyIds.has(id)) {
                cvs.deleteObject(id)
            }
        }
    }

    handleRuins() {
        const {starSystem, cvs, selectedObject, selectObject} = this.starMap
        const {ruins} = starSystem
        
        if (!ruins) return
        
        const existingRuinsIds = new Set()
        
        ruins.forEach((ruin) => {
            // Check if discovered
            const hasBeenSeen = gs.lastSeenDates.has(ruin)
            const isInVisionRange = gs.fleet && gs.fleet.mapViewDistance && 
                calcDistance(ruin.x, ruin.y, gs.fleet.x, gs.fleet.y) <= gs.fleet.mapViewDistance
            
            // Don't show ruins at all if not discovered
            if (!hasBeenSeen && !isInVisionRange) return
            
            existingRuinsIds.add(`ruins${ruin.uuid}`)
            existingRuinsIds.add(`ruinslabel${ruin.uuid}`)
            const ruinsId = `ruins${ruin.uuid}`
            const labelId = `ruinslabel${ruin.uuid}`
            
            let ruinsObj = cvs.getObject(ruinsId)
            let labelObj = cvs.getObject(labelId)
            
            if (!ruinsObj) {
                ruinsObj = cvs.addEmptyRectangle(ruinsId, ruin.x, ruin.y, ruin.radius * 30, ruin.radius * 30, 8, ruin.color, 1, () => selectObject.call(this.starMap, ruin))
                labelObj = cvs.addText(labelId, ruin.x, ruin.y, 0, -24, ruin.name, ruin.color, DEFAULT_FONT_SIZE, 2, () => selectObject.call(this.starMap, ruin))
                
                const objs = [ruinsObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        labelObj.visible = true
                        for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                    }
                    obj.onHoverEnd = () => {
                        labelObj.visible = false
                        for (const obj3 of objs) obj3.strokeColor = (ruin == selectedObject) ? COLORS.Green : ruin.color
                    }
                    obj.onHoverEnd()
                }
            }
            
            ruinsObj.x = ruin.x
            ruinsObj.y = ruin.y
            labelObj.x = ruin.x
            labelObj.y = ruin.y
            ruinsObj.visible = true
            
            if (ruin == selectedObject) {
                ruinsObj.strokeColor = COLORS.Green
                labelObj.strokeColor = COLORS.Green
                labelObj.visible = true
            }
        })
        
        for (const [id, obj] of cvs.objectMap.entries()) {
            if (id.startsWith('ruins') && !existingRuinsIds.has(id)) {
                cvs.deleteObject(id)
            }
        }
    }
}
