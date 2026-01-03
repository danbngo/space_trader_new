/*
StarMap
ticket speed: 1 hour per real life second
default zoom distances: 1200px = half the size of the solar system
*/

/**
 * @param {StarSystem} starSystem
 * @param {Fleet|Planet} autoSelectObject
 * 
 */
class StarMap extends BaseMap {
    constructor(starSystem = new StarSystem(), autoSelectObject) {
        super()
        console.log('CREATING STAR MAP FOR SYSTEM:',starSystem,'with autoselect obj:',autoSelectObject)
        this.starSystem = starSystem

        this.gameYearsPerMs = STAR_MAP_YEARS_PER_MS

        this.initializeDOM(this.starSystem.radius*4, this.starSystem.radius*0.4, this.starSystem.radius*40, this.starSystem.radius*1)

        for (const bgStar of starSystem.backgroundStars) bgStar.reset()

        // Allow clicking empty space to select arbitrary coordinates
        this.cvs.onClickWorldXY = (x, y) => {
            if (calcDistance(x, y, 0 ,0) > starSystem.radius) return
            const waypoint = new Waypoint(x, y)
            this.selectObject(waypoint)
        }

        this.handleCanvasObjects()
        this.refresh()
        this.selectObject(autoSelectObject || gs.fleet)
        if (StarMap.lastZoom) this.adjustZoom(StarMap.lastZoom/this.cvs.zoom)
        
        // Set starMap reference for all fleet AIs
        this.updateFleetAIReferences()
    }

    static lastZoom = 1

    adjustZoom(modifier = 1.0) {
        this.cvs.adjustZoom(modifier)
        StarMap.lastZoom = this.cvs.zoom
    }

    /**
     * Add a temporary popup text at a location
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate  
     * @param {string} text - Text to display
     * @param {number[]} color - Color array [r,g,b,a]
     * @param {number} duration - Duration in milliseconds (default 2000)
     */
    addPopup(x, y, text, color = COLORS.White, duration = 2000) {
        const popupId = `popup_${Date.now()}_${Math.random()}`
        const textObj = this.cvs.addText(popupId, x, y, 0, -DEFAULT_FONT_SIZE, text, color, DEFAULT_FONT_SIZE, 2)
        textObj.setDurationMs(duration)
        return textObj
    }

    /**
     * Update all fleet AIs to have a reference to this StarMap
     */
    updateFleetAIReferences() {
        for (const fleet of this.starSystem.fleets) {
            if (fleet.fleetAI) {
                fleet.fleetAI.starMap = this
            }
        }
    }
    
    onDeferredInit() {
        this.cvs.autoResize()
        this.refresh()
        //this.selectObject(gs.fleet)
    }

    refresh() {
        //console.log('STARMAP REFRESH CALLED')
        this.refreshControls();
        this.refreshInfoBar();
        this.refreshObjectPane();
        this.handleCanvasObjects();
    }

    refreshControls() {
        this.controls.innerHTML = ""
        
        ce({
            parent:this.controls,
            classNames: ['starmap-buttons'],
            children: [
                ce({tag:'button', classNames: [(this.paused && !gs.location) || (!this.paused && gs.location) ? 'highlighted' : null] , innerHTML:this.paused ? '▶' : '⏸', onClick: () => this.togglePause()}),
                ce({tag:'button', innerHTML:'+', onClick: () => this.adjustZoom(1.33)}),
                ce({tag:'button', innerHTML:'-', onClick: () => this.adjustZoom(0.66)}),
                ce({tag:'button', classNames: [gs.captain.skillPoints > 0 ? 'highlighted' : null], innerHTML:'?', onClick: () => showAssistantMenu()}),
            ]
        })
    }

    refreshInfoBar() {
        const {fleet, year} = gs
        const {location, route} = fleet
        const destination = route?.destination
        const distance = roundToPlaces(route?.path.distance, 2)
        const endYear = route?.endYear
        const yearsRemaining = describeTimespan(endYear-year)

        /** @param {SpaceObject|Waypoint} destination */
        const destinationLink = (destination)=> {
            return ce({innerHTML: coloredName(destination), onClick: ()=>this.selectObject(destination), style: {color: colorArrToRgbaString(destination.color)}, classNames:['clickable-text']})
        }

        this.infoBar.innerHTML = ""
        ce({
            parent:this.infoBar,
            classNames: ['starmap-info-bar'],
            children: [
                `${describeDate(year)} | `,
                ce({innerHTML: coloredName(fleet), onClick: ()=>this.selectObject(fleet), style: {color: colorArrToRgbaString(fleet.color)}, classNames:['clickable-text']}),
                ` | `,
                destination ? ce({
                    style: {display:'flex', gap:'6px', paddingBottom:'8px'},
                    children: [
                        `→`,
                        destinationLink(destination),
                        ` | Distance: ${distance} AU | ETA: ${yearsRemaining}`
                    ]
                })
                : location ? destinationLink(location)
                : '(Space)',
            ]
        })
    }

    handleCanvasObjects() {
        this.handleCanvasBackgroundStars()
        this.handleCanvasAsteroids()
        this.handleCanvasOrbits()
        this.handleCanvasStars()
        this.handleCanvasPlanets()
        this.handleCanvasSpaceStations()
        this.handleCanvasAnomalies()
        this.handleCanvasRuins()
        this.handleCanvasFleets()
        this.handleCanvasWaypoint()
        this.cvs.redraw(true)
    }

    handleCanvasBackgroundStars() {
        const {starSystem, cvs} = this
        const {backgroundStars} = starSystem
        
        const sizeOffset = Math.max(this.cvs.canvas.width, this.cvs.canvas.height)/SOLAR_SYSTEM_RADIUS_IN_AU * 4
        backgroundStars.forEach((bgStar, index) => {
            bgStar.twinkle(gs.year)
            if (!cvs.pixels[index]) {
                cvs.addPixel(0, 0, bgStar.color, bgStar.radius, bgStar.x * sizeOffset, bgStar.y * sizeOffset, true)
            }
            cvs.pixels[index].a = bgStar.color[3]
        })
    }

    handleCanvasAsteroids() {
        const {starSystem, cvs} = this
        const {backgroundStars, asteroids} = starSystem
        const numBackgroundStars = backgroundStars.length
        
        asteroids.forEach((asteroid, index) => {
            const pixelIndex = numBackgroundStars + index
            if (!cvs.pixels[pixelIndex]) {
                cvs.addPixel(asteroid.x, asteroid.y, asteroid.color, asteroid.radius)
            }
            const pixel = cvs.pixels[pixelIndex]
            pixel.x = asteroid.x
            pixel.y = asteroid.y
        })
    }

    handleCanvasOrbits() {
        const {starSystem, cvs} = this
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

    handleCanvasStars() {
        const {starSystem, cvs} = this
        const {stars} = starSystem

        stars.forEach((body) => {
            const id = `star${body.uuid}`
            let cvsObject = cvs.getObject(id)
            
            if (!cvsObject) {
                cvsObject = cvs.addFilledCircle(id, body.x, body.y, body.radius/EARTH_RADII_PER_AU * 25, 12, body.color, () => this.selectObject(body))
            }
            
            cvsObject.x = body.x
            cvsObject.y = body.y
            cvsObject.strokeColor = (body == this.selectedObject) ? COLORS.Green : COLORS.Black
        })
    }

    handleCanvasPlanets() {
        const {starSystem, cvs} = this
        const {planets, dwarfPlanets} = starSystem
        const allPlanets = [...planets, ...dwarfPlanets]

        allPlanets.forEach((body) => {
            const planetId = `planet${body.uuid}`
            const labelId = `planetlabel${body.uuid}`
            
            let planetObj = cvs.getObject(planetId)
            let labelObj = cvs.getObject(labelId)
            
            // Create objects if they don't exist
            if (!planetObj) {
                planetObj = cvs.addFilledCircle(planetId, body.x, body.y, body.radius/EARTH_RADII_PER_AU * 150, 8, body.color, () => this.selectObject(body))
                labelObj = cvs.addText(labelId, body.x, body.y, 0, -32, body.name, body.color, DEFAULT_FONT_SIZE, 2, () => this.selectObject(body))
                
                const objs = [planetObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        labelObj.visible = true
                        for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                    }
                    obj.onHoverEnd = () => {
                        labelObj.visible = false
                        for (const obj3 of objs) obj3.strokeColor = (body == this.selectedObject) ? COLORS.Green : COLORS.Black
                    }
                    obj.onHoverEnd()
                }
            }
            
            // Update positions and selection state
            planetObj.x = body.x
            planetObj.y = body.y
            labelObj.x = body.x
            labelObj.y = body.y
            
            if (body == this.selectedObject) {
                planetObj.strokeColor = COLORS.Green
                labelObj.strokeColor = COLORS.Green
            }
        })
    }

    handleCanvasSpaceStations() {
        const {starSystem, cvs} = this
        const {spaceStations} = starSystem
        
        if (!spaceStations) return

        spaceStations.forEach((station) => {
            const stationId = `station${station.uuid}`
            const labelId = `stationlabel${station.uuid}`
            
            let stationObj = cvs.getObject(stationId)
            let labelObj = cvs.getObject(labelId)
             
            // Create objects if they don't exist
            if (!stationObj) {
                stationObj = cvs.addFilledRectangle(stationId, station.x, station.y, station.radius, station.radius, 6, station.color, 0, () => this.selectObject(station))
                labelObj = cvs.addText(labelId, station.x, station.y, 0, -24, station.name, station.color, DEFAULT_FONT_SIZE, 2, () => this.selectObject(station))
                
                const objs = [stationObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        labelObj.visible = true
                        for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                    }
                    obj.onHoverEnd = () => {
                        labelObj.visible = false
                        for (const obj3 of objs) obj3.strokeColor = (station == this.selectedObject) ? COLORS.Green : COLORS.Black
                    }
                    obj.onHoverEnd()
                }
            }
            
            // Update positions and selection state
            stationObj.x = station.x
            stationObj.y = station.y
            labelObj.x = station.x
            labelObj.y = station.y
            
            if (station == this.selectedObject) {
                stationObj.strokeColor = COLORS.Green
                labelObj.strokeColor = COLORS.Green
            }
        })
    }

    handleCanvasAnomalies() {
        const {starSystem, cvs} = this
        const {anomalies} = starSystem
        
        if (!anomalies) return
        
        // Track existing anomaly UUIDs
        const existingAnomalyIds = new Set()
        
        anomalies.forEach((anomaly) => {
            // Check if anomaly is detectable by player fleet
            const isVisible = anomaly.detectable(gs.fleet)
            
            existingAnomalyIds.add(`anomaly${anomaly.uuid}`)
            existingAnomalyIds.add(`anomalylabel${anomaly.uuid}`)
            const anomalyId = `anomaly${anomaly.uuid}`
            const labelId = `anomalylabel${anomaly.uuid}`
            
            let anomalyObj = cvs.getObject(anomalyId)
            let labelObj = cvs.getObject(labelId)
            
            // Create objects if they don't exist
            if (!anomalyObj) {
                anomalyObj = cvs.addEmptyCircle(anomalyId, anomaly.x, anomaly.y, anomaly.radius * 10, 2, anomaly.color, 1, () => this.selectObject(anomaly))
                labelObj = cvs.addText(labelId, anomaly.x, anomaly.y, 0, -24, anomaly.name, anomaly.color, DEFAULT_FONT_SIZE, 2, () => this.selectObject(anomaly))
                labelObj.visible = false
                
                const objs = [anomalyObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        // Only allow hover if detectable
                        if (!anomaly.detectable(gs.fleet)) return
                        labelObj.visible = true
                        for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                    }
                    obj.onEndHover = () => {
                        labelObj.visible = false
                        // Reset to selection color if selected, otherwise clear
                        if (anomaly === this.selectedObject) {
                            for (const obj2 of objs) obj2.strokeColor = COLORS.Green
                        } else {
                            for (const obj2 of objs) obj2.strokeColor = undefined
                        }
                    }
                }
            }
            
            // Update positions and selection state
            anomalyObj.x = anomaly.x
            anomalyObj.y = anomaly.y
            labelObj.x = anomaly.x
            labelObj.y = anomaly.y
            
            // Set visibility based on detection range
            anomalyObj.visible = isVisible
            // Only show label if visible and either hovered or selected
            if (!isVisible) {
                labelObj.visible = false
            }
            
            // Update selection colors
            if (anomaly == this.selectedObject) {
                anomalyObj.strokeColor = COLORS.Green
                labelObj.strokeColor = COLORS.Green
                labelObj.visible = isVisible
            } else if (!labelObj.visible) {
                // Clear stroke color if not selected and not hovered
                anomalyObj.strokeColor = undefined
                labelObj.strokeColor = undefined
            }
        })
        
        // Remove canvas objects for anomalies that no longer exist
        for (const [id, obj] of cvs.objectMap.entries()) {
            if (id.startsWith('anomaly') && !existingAnomalyIds.has(id)) {
                cvs.deleteObject(id)
            }
        }
    }

    handleCanvasRuins() {
        const {starSystem, cvs} = this
        const {ruins} = starSystem
        
        if (!ruins) return
        
        // Track existing ruins UUIDs
        const existingRuinsIds = new Set()
        
        ruins.forEach((ruin) => {
            existingRuinsIds.add(`ruins${ruin.uuid}`)
            existingRuinsIds.add(`ruinslabel${ruin.uuid}`)
            const ruinsId = `ruins${ruin.uuid}`
            const labelId = `ruinslabel${ruin.uuid}`
            
            let ruinsObj = cvs.getObject(ruinsId)
            let labelObj = cvs.getObject(labelId)
            
            // Create objects if they don't exist (empty square/rectangle)
            if (!ruinsObj) {
                ruinsObj = cvs.addEmptySquare(ruinsId, ruin.x, ruin.y, ruin.radius * 15, 2, ruin.color, 1, () => this.selectObject(ruin))
                labelObj = cvs.addText(labelId, ruin.x, ruin.y, 0, -24, ruin.name, ruin.color, DEFAULT_FONT_SIZE, 2, () => this.selectObject(ruin))
                labelObj.visible = false
                
                const objs = [ruinsObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        labelObj.visible = true
                        for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                    }
                    obj.onEndHover = () => {
                        labelObj.visible = false
                        // Reset to selection color if selected, otherwise clear
                        if (ruin === this.selectedObject) {
                            for (const obj2 of objs) obj2.strokeColor = COLORS.Green
                        } else {
                            for (const obj2 of objs) obj2.strokeColor = undefined
                        }
                    }
                }
            }
            
            // Update positions
            ruinsObj.x = ruin.x
            ruinsObj.y = ruin.y
            labelObj.x = ruin.x
            labelObj.y = ruin.y
            
            // Ruins are always visible
            ruinsObj.visible = true
            
            // Update selection colors
            if (ruin == this.selectedObject) {
                ruinsObj.strokeColor = COLORS.Green
                labelObj.strokeColor = COLORS.Green
                labelObj.visible = true
            } else if (!labelObj.visible) {
                // Clear stroke color if not selected and not hovered
                ruinsObj.strokeColor = undefined
                labelObj.strokeColor = undefined
            }
        })
        
        // Remove canvas objects for ruins that no longer exist
        for (const [id, obj] of cvs.objectMap.entries()) {
            if (id.startsWith('ruins') && !existingRuinsIds.has(id)) {
                cvs.deleteObject(id)
            }
        }
    }

    handleCanvasFleets() {
        const {starSystem, cvs} = this
        const {fleets} = starSystem

        // Track existing fleet UUIDs
        const existingFleetIds = new Set()
        
        fleets.forEach((fleet) => {
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
            
            const fleetAngle = fleet.route && fleet.route.path ? fleet.route.path.angle : undefined//-Math.PI/2
            const isPlayerFleet = fleet === gs.fleet
            
            // Create objects if they don't exist
            if (!fleetObj) {
                fleetObj = cvs.addFilledTriangle(fleetId, fleet.x, fleet.y, fleet.radius/EARTH_RADII_PER_AU, fleet.radius/EARTH_RADII_PER_AU, 12, fleet.color, fleetAngle, () => this.selectObject(fleet))
                pathObj = cvs.addLine(pathId, 0, 0, 0, 0, fleet.color, 1)
                thrusterObj = cvs.addFilledTriangle(thrusterId, fleet.x, fleet.y, fleet.radius/EARTH_RADII_PER_AU*0.5, fleet.radius/EARTH_RADII_PER_AU*0.5, 6, COLORS.Orange)
                labelObj = cvs.addText(labelId, fleet.x, fleet.y, 0, -32, fleet.name, fleet.color, DEFAULT_FONT_SIZE, 2, () => this.selectObject(fleet))
                
                labelObj.visible = isPlayerFleet
                
                const objs = [fleetObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
                        labelObj.visible = true
                        for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                    }
                    obj.onHoverEnd = () => {
                        labelObj.visible = isPlayerFleet
                        for (const obj3 of objs) obj3.strokeColor = (fleet == this.selectedObject) ? COLORS.Green : COLORS.Black
                    }
                    if (!isPlayerFleet) obj.onHoverEnd()
                }
            }
            
            // Update fleet position and angle
            fleetObj.x = fleet.x
            fleetObj.y = fleet.y
            if (fleetAngle !== undefined) fleetObj.angle = fleetAngle
            fleetObj.strokeColor = (fleet == this.selectedObject) ? COLORS.Green : COLORS.Black
            fleetObj.fillColor[3] = 1-(fleet.cloakLevel*0.95)
            
            // Update label
            if (fleet.location || !fleet.route) {
                labelObj.visible = false
            } else {
                labelObj.visible = isPlayerFleet
                labelObj.x = fleet.x
                labelObj.y = fleet.y
            }
            
            // Update path (only show for player fleet or selected fleet)
            const shouldShowPath = (fleet === gs.fleet || fleet === this.selectedObject) && fleet.route && fleet.route.path
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
            if (fleet.location || !fleet.route) {
                thrusterObj.visible = false
            } else {
                const [screenOffsetX, screenOffsetY] = rotatePoint(10, 0, 0, 0, fleetAngle - Math.PI)
                if (fleetAngle !== undefined) thrusterObj.angle = fleetAngle - Math.PI
                thrusterObj.visible = true
                thrusterObj.x = fleet.x
                thrusterObj.y = fleet.y
                thrusterObj.screenOffsetX = screenOffsetX
                thrusterObj.screenOffsetY = screenOffsetY
                thrusterObj.fillColor[3] = 1-(fleet.cloakLevel*0.95)
            }
        })
        
        // Remove canvas objects for fleets that no longer exist
        for (const [id, obj] of cvs.objectMap.entries()) {
            if ((id.startsWith('fleet') || id.startsWith('fleetthruster') || id.startsWith('fleetpath') || id.startsWith('fleetlabel')) && !existingFleetIds.has(id)) {
                cvs.deleteObject(id)
            }
        }
    }

    handleCanvasWaypoint() {
        const {cvs} = this
        const waypointId = 'waypointMarker'
        
        let waypointMarker = cvs.getObject(waypointId)
        
        if (!waypointMarker) {
            waypointMarker = cvs.addFilledTriangle(waypointId, 0, 0, 0, 0, 12, COLORS.Targeting, Math.PI/2)
        }
        
        if (this.selectedObject && this.selectedObject.isWaypoint) {
            waypointMarker.visible = true
            waypointMarker.x = this.selectedObject.x
            waypointMarker.y = this.selectedObject.y
        } else {
            waypointMarker.visible = false
        }
    }

    refreshObjectPane() {
        this.objectPane.innerHTML = '';
        const obj = this.selectedObject
        if (!obj) {
            this.objectPane.textContent = '(Select an object on the map.)';
            return;
        }
        const isDockedHere = obj == gs.location
        const cantTravelHere = (obj == gs.location) || gs.fleet.stranded
        const container = ce({parent:this.objectPane, classNames:['starmap-object-panel']})
        ce({parent:container, tag:'h3', innerHTML: coloredName(obj), onClick: ()=>this.selectObject(obj),
            style: {filter: `drop-shadow(1px 0 0 ${colorArrToRgbaString(COLORS.Green)}) drop-shadow(0 1px 0 ${colorArrToRgbaString(COLORS.Green)})  drop-shadow(0 -0.5px 0 ${colorArrToRgbaString(COLORS.Green)})  drop-shadow(-0.5px 0 0 ${colorArrToRgbaString(COLORS.Green)})`}
        })
        //const allPlanets = [...this.starSystem.planets, ...this.starSystem.dwarfPlanets]
        const cvsId = obj instanceof Planet ? `planet${obj.uuid}`
            : obj instanceof Star ? `star${obj.uuid}` 
            : obj instanceof Fleet ? `fleet${obj.uuid}`
            : ''
        ce({parent:container, style: {margin: 'auto'}, onClick: ()=>this.selectObject(obj), children:[
            this.cvs.getObject(cvsId)?.asImage(25, COLORS.LightGreen) || null
        ]})
        if (obj instanceof Fleet) {
            const totalShips = obj.ships.length
            const disabledShips = obj.ships.filter(ship => ship.disabled).length
            const activeShips = totalShips - disabledShips
            
            // Calculate average hull percentage
            let totalHullPercent = 0
            if (totalShips > 0) {
                totalHullPercent = obj.ships.reduce((sum, ship) => {
                    const hullPercent = ship.hull[1] > 0 ? (ship.hull[0] / ship.hull[1]) * 100 : 0
                    return sum + hullPercent
                }, 0) / totalShips
            }
            
            ce({parent:container, innerHTML:`Ships: ${activeShips}/${totalShips} active`})
            ce({parent:container, innerHTML:`Hull: ${roundToPlaces(totalHullPercent, 1)}%`})
            
            // Add Travel button for non-player fleets
            if (obj !== gs.fleet) {
                const distance = roundToPlaces(calcDistance(gs.fleet.x, gs.fleet.y, obj.x, obj.y), 2)
                ce({parent:container, innerHTML:`Distance: ${distance} AU`})
                
                // Create test route to check if interception is possible
                const testRoute = new Route(gs.fleet, obj, gs.year)
                if (testRoute.valid) {
                    const travelTime = testRoute.travelTime
                    ce({parent:container, innerHTML:`ETA: ${describeTimespan(travelTime)}`})
                    ce({parent:container, tag:'button', innerHTML:'Intercept', onClick:()=>this.setDestination(obj, true), disabled: gs.fleet.stranded})
                } else {
                    ce({parent:container, innerHTML:`Cannot intercept (too fast)`})
                }
            }
        }
        if (obj == gs.fleet) {
            if (gs.location) ce({parent:container, tag:'button', innerHTML:`Dock (${coloredName(gs.location)})`, onClick:()=>this.explore(gs.location)})
            
            // Check if player is near an asteroid for mining
            const nearbyBelt = checkNearbyAsteroid()
            if (nearbyBelt) {
                ce({parent:container, tag:'button', innerHTML:'⛏️ Mine', onClick: () => startMining()})
            }
        }
        if (obj instanceof Planet) {
            const distance = roundToPlaces(calcDistance(gs.fleet.x, gs.fleet.y, obj.x, obj.y), 2)
            const travelTime = distance / gs.fleet.speed
            ce({parent:container, innerHTML:`Distance: ${distance} AU`})
            ce({parent:container, innerHTML:`ETA: ${describeTimespan(travelTime)}`})
            ce({parent:container, tag:'button', innerHTML:isDockedHere ? 'Dock' : 'Scan', onClick:()=>this.explore(obj)})
            ce({parent:container, tag:'button', innerHTML:'Travel', onClick:()=>this.setDestination(obj, true), disabled: cantTravelHere})
        }
        // Handle waypoint (arbitrary coordinates)
        if (obj.isWaypoint) {
            const distance = roundToPlaces(calcDistance(gs.fleet.x, gs.fleet.y, obj.x, obj.y), 2)
            const travelTime = distance / gs.fleet.speed
            ce({parent:container, innerHTML:`Distance: ${distance} AU`})
            ce({parent:container, innerHTML:`ETA: ${describeTimespan(travelTime)}`})
            ce({parent:container, tag:'button', innerHTML:'Travel', onClick:()=>this.setDestination(obj, true), disabled: gs.fleet.stranded})
        }
    }

    selectObject(obj) {
        for (const obj of this.cvs.drawOrder) {
            if (obj.strokeColor == COLORS.Green) {
                obj.strokeColor = COLORS.Black
            }
        }
        console.log('selected:',obj)
        this.selectedObject = obj;
        this.cvs.moveCameraTo(obj.x, obj.y)
        this.refresh();
    }

    explore(planet = gs.location) {
        if (planet instanceof Planet) showPlanetMenu(planet)
    }

    /** @param {Planet | Waypoint | Fleet} obj */
    setDestination(obj, unpause = false) {
        if (obj instanceof Planet) {
            gs.fleet.route = new Route(gs.fleet, obj)
            gs.fleet.location = undefined
        } else if (obj instanceof Fleet) {
            // Attempt to intercept another fleet
            const interceptRoute = new Route(gs.fleet, obj)
            if (interceptRoute.valid) {
                gs.fleet.route = interceptRoute
                gs.fleet.location = undefined
            } else {
                console.log('Cannot intercept fleet - target is too fast or too far')
                // Don't assign route or move the player
                return
            }
        } else if (obj.isWaypoint) {
            // Create a route to arbitrary coordinates
            gs.fleet.route = new Route(gs.fleet, obj)
            gs.fleet.location = undefined
        }
        if (unpause) this.togglePause(false)
        this.refresh()
    }

    togglePause(newPausedState = !this.paused) {
        console.log('setting paused to:',newPausedState)
        this.paused = newPausedState
        if (!this.paused) {
            this.lastTickMs = Date.now()
            this.tick()
        }
        this.refresh() //always do first refresh, as fleets launch during pause/unpause
    }

    tick() {
        if (this.paused) return
        const playerWasDocked = (gs.location !== undefined)

        const currentTime = Date.now()
        const elapsedMs = Math.min(this.maxMsPerTick, currentTime - this.lastTickMs)
        this.lastTickMs = currentTime
        const elapsedYears = elapsedMs * this.gameYearsPerMs;

        gs.year += elapsedYears
        gs.system.updatePositions()

        this.refreshInfoBar()
        this.handleCanvasObjects()

        //pause if player reached his destination
        if (!playerWasDocked && gs.location) {
            console.log('pausing since player reached destination')
            showPlanetMenu(gs.location)
            return
        }

        // Check for collision-based encounters
        if (checkForCollisionEncounter()) return

        checkForEvents(elapsedYears)

        requestAnimationFrame(()=>this.tick())
    }
}


/**
 * 
 * @param {Fleet|Planet} autoSelectObject 
 */
function showStarMap(autoSelectObject = gs.fleet) {
    const starMap = new StarMap(gs.system, autoSelectObject)
    showMap(starMap)
}

