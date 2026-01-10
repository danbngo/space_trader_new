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
        const perfStart = STARMAP_DEBUG_CONFIG.logPerformance ? performance.now() : 0;
        
        // Background stars are handled by separate bgCvs canvas in starMap.js
        if (STARMAP_DEBUG_CONFIG.displayAsteroids) this.handleAsteroids();
        if (STARMAP_DEBUG_CONFIG.displayOrbits) this.handleOrbits();
        // Vision circle removed - too jarring
        // this.handleViewDistanceCircle()
        if (STARMAP_DEBUG_CONFIG.displayStars) this.handleStars();
        if (STARMAP_DEBUG_CONFIG.displayPlanets) this.handlePlanets();
        if (STARMAP_DEBUG_CONFIG.displaySpaceStations) this.handleSpaceStations();
        this.handleDestinationLine();
        this.handlePlayerLocationIndicator();

        this.starMap.cvs.recalculateDrawOrder()
        
        if (STARMAP_DEBUG_CONFIG.logPerformance) {
            const perfEnd = performance.now();
            console.log(`StarMapBodiesHandler.handleAll: ${(perfEnd - perfStart).toFixed(2)}ms`);
        }
    }
    
    /**
     * Updates all planet decorators (craters, etc.) - called when camera/zoom changes
     */
    updateAllDecorators() {
        const {starSystem} = this.starMap
        const {planets, dwarfPlanets} = starSystem
        const allPlanets = [...planets, ...dwarfPlanets]
        
        allPlanets.forEach((body) => {
            if (body.decorators && body.decorators.length > 0) {
                body.decorators.forEach(decorator => {
                    decorator.update()
                })
            }
        })
    }

    handleAsteroids() {
        const {starSystem, cvs} = this.starMap
        const { asteroids} = starSystem
        
        asteroids.forEach((asteroid, index) => {
            const asteroidId = `asteroid${asteroid.uuid}`
            if (!cvs.getObject(asteroidId)) {
                const circle = cvs.addFilledCircle(asteroidId, asteroid.x, asteroid.y, asteroid.radius, 2, asteroid.color, null)
                circle.strokeColor = [...COLORS.Black]
            }
            const asteroidObj = cvs.getObject(asteroidId)
            asteroidObj.zIndex = -0.1
            asteroidObj.x = asteroid.x
            asteroidObj.y = asteroid.y
            
            // Calculate screen radius and hide if too small when zoomed out
            const screenRadius = asteroid.radius
            /*if (screenRadius < ASTEROID_MIN_SCREEN_RADIUS) {
                asteroidObj.visible = false
                return
            }*/
            asteroidObj.visible = true
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
                cvsObject.zIndex = -1
            }
            
            cvsObject.x = orbitingBody.parent.x
            cvsObject.y = orbitingBody.parent.y
        })
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
                const displaySize = Math.sqrt(body.radius/EARTH_RADII_PER_AU) * 3
                unknownObj = cvs.addEmptyCircle(unknownId, body.x, body.y, displaySize, SUN_MIN_SCREEN_SIZE, COLORS.White, 1, () => selectObject.call(this.starMap, body))
                unknownObj.clickPriority = 12
                
                // Add hover handlers to unknown circle
                unknownObj.onHover = () => {
                    unknownObj.strokeColor = COLORS.Cyan
                    unknownObj.lineWidth = 2
                }
                unknownObj.onHoverEnd = () => {
                    unknownObj.strokeColor = COLORS.White
                    unknownObj.lineWidth = 1
                }
                unknownObj.onHoverEnd()
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
            cvsObject.lineWidth = (body == selectedObject) ? 2 : 1
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
                
                // Associate and create decorators
                if (body.decorators && body.decorators.length > 0) {
                    body.decorators.forEach(decorator => {
                        decorator.associate(cvs, planetObj)
                        decorator.decorate()
                    })
                }
                
                // Create night side overlay as a crescent/gibbous shape
                const crescentVertices = []
                const numPoints = 10 // Reduced from 25 for better performance
                const terminatorOffset = 0.75 // Controls the curvature of the terminator line
                const shadowPositionOffset = 0.33 // Shifts shadow toward sun-facing side (0.25 = 25% of radius)
                
                for (let i = 0; i <= numPoints; i++) {
                    const angle = Math.PI * i / numPoints - Math.PI / 2
                    const x = Math.cos(angle) + shadowPositionOffset
                    const y = Math.sin(angle)
                    crescentVertices.push([x, y])
                }
                
                for (let i = numPoints; i >= 0; i--) {
                    const angle = Math.PI * i / numPoints - Math.PI / 2
                    const x = Math.cos(angle) * terminatorOffset - terminatorOffset + shadowPositionOffset
                    const y = Math.sin(angle)
                    crescentVertices.push([x, y])
                }
                
                const nightColor = [0, 0, 0, 0.7]
                nightSideObj = cvs.addPolygon(nightSideId, body.x, body.y, crescentVertices, displaySize, minScreenSize, nightColor, null, 0, null, 11)
                
                if (STARMAP_DEBUG_CONFIG.displayPlanetLabels) {
                    labelObj = cvs.addText(labelId, body.x, body.y, 0, -32, body.name, body.color, DEFAULT_FONT_SIZE, 2, () => selectObject.call(this.starMap, body))
                    labelObj.clickPriority = 10
                    labelObj.visible = false // Start hidden
                    
                    const objs = [planetObj, labelObj]
                    for (const obj of objs) {
                        obj.onHover = () => {
                            // Use descriptor property
                            labelObj.textContent = body.descriptor
                            labelObj.visible = true
                            for (const obj2 of objs) {
                                obj2.strokeColor = COLORS.Cyan
                                obj2.lineWidth = 2
                            }
                        }
                        obj.onHoverEnd = () => {
                            labelObj.visible = false
                            for (const obj3 of objs) {
                                obj3.strokeColor = (body == selectedObject) ? COLORS.Green : COLORS.Black
                                obj3.lineWidth = (body == selectedObject) ? 2 : 1
                            }
                        }
                        obj.onHoverEnd()
                    }
                } else {
                    // No labels - just handle hover on planet
                    planetObj.onHover = () => {
                        planetObj.strokeColor = COLORS.Cyan
                        planetObj.lineWidth = 2
                    }
                    planetObj.onHoverEnd = () => {
                        planetObj.strokeColor = (body == selectedObject) ? COLORS.Green : COLORS.Black
                        planetObj.lineWidth = (body == selectedObject) ? 2 : 1
                    }
                    planetObj.onHoverEnd()
                }
            }
            
            // Create unknown marker circle (no question mark)
            if (!unknownObj) {
                const minScreenSize = body.objectType == OBJECT_TYPES.DWARF_PLANET ? DWARF_PLANET_MIN_SCREEN_SIZE : PLANET_MIN_SCREEN_SIZE
                const displaySize = Math.pow(body.radius/EARTH_RADII_PER_AU, 0.4) * 3.5
                unknownObj = cvs.addEmptyCircle(unknownId, body.x, body.y, displaySize, minScreenSize, COLORS.White, 1, () => selectObject.call(this.starMap, body))
                unknownObj.clickPriority = 12
                
                // Add hover handlers to unknown circle
                unknownObj.onHover = () => {
                    unknownObj.strokeColor = COLORS.Cyan
                    unknownObj.lineWidth = 2
                }
                unknownObj.onHoverEnd = () => {
                    unknownObj.strokeColor = COLORS.White
                    unknownObj.lineWidth = 1
                }
                unknownObj.onHoverEnd()
            }
            
            // Show planet only if discovered or in vision range
            const isDiscovered = hasBeenSeen || isInVisionRange
            planetObj.visible = isDiscovered
            if (labelObj) labelObj.visible = false
            nightSideObj.visible = isDiscovered
            unknownObj.visible = !hasBeenSeen // Show unknown circle for all unseen planets
            
            // Set default stroke
            planetObj.strokeColor = COLORS.Black
            planetObj.lineWidth = 1
            
            // Update stroke for selected planet
            if (body == selectedObject) {
                planetObj.strokeColor = COLORS.Green
                planetObj.lineWidth = 2
            }
            
            // Highlight player's location in green with 2 linewidth (overrides selection if both)
            if (gs.fleet && gs.fleet.location === body) {
                planetObj.strokeColor = COLORS.Green
                planetObj.lineWidth = 2
            }
            
            // Keep planets at full brightness regardless of vision range
            if (isDiscovered) {
                planetObj.fillColor[3] = 1.0
            }
            
            // Update positions
            planetObj.x = body.x
            planetObj.y = body.y
            labelObj.x = body.x
            labelObj.y = body.y
            unknownObj.x = body.x
            unknownObj.y = body.y
            
            // Update decorators
            if (body.decorators && body.decorators.length > 0) {
                body.decorators.forEach(decorator => {
                    decorator.update()
                })
            }
            
            // Update nightside position and angle only when planet is visible
            if (isDiscovered && nightSideObj && body.orbit) {
                nightSideObj.x = body.x
                nightSideObj.y = body.y
                const angleToSun = calcAngleTowardsPoint(body.x, body.y, body.parent.x, body.parent.y)
                nightSideObj.angle = angleToSun + Math.PI
            }
            
            // Update label stroke color to match planet
            if (labelObj && body == selectedObject) {
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
                        // Use descriptor property
                        labelObj.textContent = station.descriptor
                        labelObj.visible = true
                        for (const obj2 of objs) {
                            obj2.strokeColor = COLORS.Cyan
                            obj2.lineWidth = 2
                        }
                    }
                    obj.onHoverEnd = () => {
                        labelObj.visible = false
                        for (const obj3 of objs) {
                            obj3.strokeColor = (station == selectedObject) ? COLORS.Green : COLORS.Black
                            obj3.lineWidth = (station == selectedObject) ? 2 : 1
                        }
                    }
                    obj.onHoverEnd()
                }
            }
            
            // Create unknown marker circle (no question mark)
            if (!unknownObj) {
                unknownObj = cvs.addEmptyCircle(unknownId, station.x, station.y, 0.2, 2, COLORS.White, 1, () => selectObject.call(this.starMap, station))
                unknownObj.clickPriority = 12
                
                // Add hover handlers to unknown circle
                unknownObj.onHover = () => {
                    unknownObj.strokeColor = COLORS.Cyan
                    unknownObj.lineWidth = 2
                }
                unknownObj.onHoverEnd = () => {
                    unknownObj.strokeColor = COLORS.White
                    unknownObj.lineWidth = 1
                }
                unknownObj.onHoverEnd()
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
            
            // Highlight player's location in green with 2 linewidth
            if (gs.fleet && gs.fleet.location === station) {
                stationObj.strokeColor = COLORS.Green
                stationObj.lineWidth = 2
            }
        })
    }

    /**
     * Handles drawing a line from player to selected destination (cyan if reachable, dark red if too far)
     */
    handleDestinationLine() {
        const {cvs, selectedObject} = this.starMap
        const fleet = gs.fleet
        const lineId = 'destinationLine'
        
        if (!fleet) {
            return
        }
        
        let lineObj = cvs.getObject(lineId)
        
        // Check if we should show the line
        const hasSelectedObject = !!selectedObject
        const notSelectingFleet = selectedObject !== fleet
        const hasXCoord = selectedObject?.x !== undefined
        const hasYCoord = selectedObject?.y !== undefined
        const canReach = selectedObject ? fleet.canReachDestination(selectedObject) : false
        
        console.log('[DestinationLine] Checks:', {
            hasSelectedObject,
            notSelectingFleet,
            hasXCoord,
            hasYCoord,
            canReach,
            fleetLocation: fleet.location,
            selectedObjectName: selectedObject?.name || 'none'
        })
        
        const shouldShowLine = hasSelectedObject && notSelectingFleet && hasXCoord && hasYCoord
        
        if (shouldShowLine) {
            // Determine line color based on whether destination is reachable
            const lineColor = canReach ? COLORS.Cyan : COLORS.DarkRed
            
            // Create or update the line
            if (!lineObj) {
                lineObj = cvs.addLine(
                    lineId,
                    fleet.x,
                    fleet.y,
                    selectedObject.x,
                    selectedObject.y,
                    lineColor,
                    2 // lineWidth
                )
                lineObj.zIndex = -1 // Draw behind everything else
            } else {
                // Update line position and color
                lineObj.x = fleet.x
                lineObj.y = fleet.y
                lineObj.x2 = selectedObject.x
                lineObj.y2 = selectedObject.y
                lineObj.strokeColor = lineColor
                lineObj.visible = true
            }
        } else {
            // Hide the line if it exists
            if (lineObj) {
                lineObj.visible = false
            }
        }
    }

    /**
     * Handles drawing an animated triangle indicator at the player's current location
     */
    handlePlayerLocationIndicator() {
        const {cvs} = this.starMap
        const fleet = gs.fleet
        const indicatorId = 'playerLocationIndicator'
        
        if (!fleet || !fleet.location) {
            // Hide indicator if no location
            const indicator = cvs.getObject(indicatorId)
            if (indicator) indicator.visible = false
            return
        }
        
        let indicator = cvs.getObject(indicatorId)
        
        // Create indicator if it doesn't exist
        if (!indicator) {
            // Upward pointing triangle (rotated 180 degrees from downward)
            const triangleVertices = [
                [0, 1],        // Bottom point (was top)
                [-0.866, -0.5], // Top left (was bottom left)
                [0.866, -0.5]   // Top right (was bottom right)
            ]
            
            indicator = cvs.addPolygon(
                indicatorId,
                fleet.location.x,
                fleet.location.y,
                triangleVertices,
                0,    // size in AU (0 = fixed screen size only)
                8,    // minScreenSize (pixels - stays constant at all zoom levels)
                COLORS.Green,
                null, // no strokeColor
                0,    // angle
                null, // no click handler
                100   // high zIndex to draw on top
            )
        }
        
        // Update position and animation
        indicator.x = fleet.location.x
        indicator.y = fleet.location.y
        indicator.visible = true
        
        // Animate bobbing and color throb
        const now = Date.now()
        const bobSpeed = 0.004 // Speed of bobbing (4x faster)
        const throbSpeed = 0.003 // Speed of color throb (2x faster)
        
        // Bob up and down (offset in screen space)
        const bobOffset = Math.sin(now * bobSpeed) * 4 // 4 pixels up/down (50% of 8)
        indicator.screenOffsetY = -30 + bobOffset // Base offset above planet + bobbing
        
        // Throb color between normal green and darker green
        const throbValue = 0.5 + 0.5 * Math.sin(now * throbSpeed) // 0.0 to 1.0
        const darkFactor = 0.4 + 0.6 * throbValue // 0.4 to 1.0
        indicator.fillColor = [
            Math.floor(COLORS.Green[0] * darkFactor),
            Math.floor(COLORS.Green[1] * darkFactor),
            Math.floor(COLORS.Green[2] * darkFactor),
            COLORS.Green[3]
        ]
    }

}
