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
        this.handleViewDistanceCircle()
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
            cvs.pixels[index].a = bgStar.color[3]
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
            const pixel = cvs.pixels[pixelIndex]
            pixel.x = asteroid.x
            pixel.y = asteroid.y
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
            // Create the view distance circle
            circle = cvs.addEmptyCircle(viewDistanceId, gs.fleet.x, gs.fleet.y, gs.fleet.mapViewDistance, 1, COLORS.Cyan, 1.0)
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
            let cvsObject = cvs.getObject(id)
            
            if (!cvsObject) {
                const displaySize = Math.sqrt(body.radius/EARTH_RADII_PER_AU) * 3
                cvsObject = cvs.addFilledCircle(id, body.x, body.y, displaySize, SUN_MIN_SCREEN_SIZE, body.color, () => selectObject.call(this.starMap, body))
            }
            
            cvsObject.x = body.x
            cvsObject.y = body.y
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
            
            let planetObj = cvs.getObject(planetId)
            let labelObj = cvs.getObject(labelId)
            let nightSideObj = cvs.getObject(nightSideId)
            
            // Create objects if they don't exist
            if (!planetObj) {
                const minScreenSize = body.objectType == OBJECT_TYPES.DWARF_PLANET ? DWARF_PLANET_MIN_SCREEN_SIZE : PLANET_MIN_SCREEN_SIZE
                const displaySize = Math.pow(body.radius/EARTH_RADII_PER_AU, 0.4) * 3.5
                planetObj = cvs.addFilledCircle(planetId, body.x, body.y, displaySize, minScreenSize, body.color, () => selectObject.call(this.starMap, body))
                planetObj.clickPriority = 10
                
                // Create night side overlay as a crescent/gibbous shape
                const crescentVertices = []
                const numPoints = 25
                const terminatorOffset = 0.25
                
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
                
                const objs = [planetObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
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
            
            // Update positions and selection state
            planetObj.x = body.x
            planetObj.y = body.y
            labelObj.x = body.x
            labelObj.y = body.y
            
            if (nightSideObj && body.orbit) {
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
            
            let stationObj = cvs.getObject(stationId)
            let labelObj = cvs.getObject(labelId)
             
            if (!stationObj) {
                stationObj = cvs.addFilledRectangle(stationId, station.x, station.y, station.radius * 16, station.radius * 16, SPACE_STATION_MIN_SCREEN_SIZE, station.color, 0, () => selectObject.call(this.starMap, station))
                
                labelObj = cvs.addText(labelId, station.x, station.y, 0, -24, station.name, station.color, DEFAULT_FONT_SIZE, 2, () => selectObject.call(this.starMap, station))
                
                const objs = [stationObj, labelObj]
                for (const obj of objs) {
                    obj.onHover = () => {
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
            
            stationObj.x = station.x
            stationObj.y = station.y
            labelObj.x = station.x
            labelObj.y = station.y
            
            if (station == selectedObject) {
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
            const isVisible = anomaly.detectable(gs.fleet)
            
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
            } else if (!labelObj.visible) {
                ruinsObj.strokeColor = undefined
                labelObj.strokeColor = undefined
            }
        })
        
        for (const [id, obj] of cvs.objectMap.entries()) {
            if (id.startsWith('ruins') && !existingRuinsIds.has(id)) {
                cvs.deleteObject(id)
            }
        }
    }
}
