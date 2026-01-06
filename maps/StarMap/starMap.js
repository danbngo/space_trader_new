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
        this.tickCounter = 0 // Track ticks for periodic updates
        this.frameCounter = 0 // Track frames for optimizing recoloring
        this.lastPlayerX = gs.fleet ? gs.fleet.x : 0
        this.lastPlayerY = gs.fleet ? gs.fleet.y : 0
        this.lastCameraX = 0
        this.lastCameraY = 0
        this.lastZoom = 1

        this.initializeDOM(this.starSystem.radius*4, this.starSystem.radius*0.4, this.starSystem.radius*40, this.starSystem.radius*1)

        for (const bgStar of starSystem.backgroundStars) bgStar.reset()

        // Initialize handlers
        this.bodiesHandler = new StarMapBodiesHandler(this)
        this.fleetsHandler = new StarMapFleetsHandler(this)

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
        
        // Start continuous waypoint animation loop (runs even when paused)
        this.fleetsHandler.animateWaypoint()
        
        // Start continuous background star update loop (runs even when paused)
        this.animateBackgroundStars()
        
        // Set starMap reference for all fleet AIs
        this.fleetsHandler.updateFleetAIReferences()
    }

    static lastZoom = 1

    animateBackgroundStars() {
        this.frameCounter++
        
        // Check if player is in motion
        const playerInMotion = gs.fleet && (gs.fleet.x !== this.lastPlayerX || gs.fleet.y !== this.lastPlayerY)
        
        // Check if camera has moved (pan or zoom)
        const cameraX = this.cvs.cameraX
        const cameraY = this.cvs.cameraY
        const zoom = this.cvs.zoom
        const cameraChanged = cameraX !== this.lastCameraX || cameraY !== this.lastCameraY || zoom !== this.lastZoom
        
        if (playerInMotion) {
            this.lastPlayerX = gs.fleet.x
            this.lastPlayerY = gs.fleet.y
        }
        
        if (cameraChanged) {
            this.lastCameraX = cameraX
            this.lastCameraY = cameraY
            this.lastZoom = zoom
        }
        
        // Update background stars every 30th frame when player is in motion OR camera changed
        if ((playerInMotion || cameraChanged) && this.frameCounter % 1 === 0) {
            this.bodiesHandler.handleBackgroundStars()
        }
        
        // Update asteroids every 600th frame when player is in motion
        if (playerInMotion && this.frameCounter % 600 === 0) {
            this.bodiesHandler.handleAsteroids()
        }
        
        this.cvs.redraw(true)
        
        // Continue animation loop
        requestAnimationFrame(() => this.animateBackgroundStars())
    }

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
        this.bodiesHandler.handleAll()
        this.fleetsHandler.handleAll()
        this.cvs.redraw(true)
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
        
        // Check if object has been discovered
        const hasBeenSeen = gs.lastSeenDates.has(obj)
        const isInVisionRange = gs.fleet && gs.fleet.mapViewDistance && obj.x !== undefined && obj.y !== undefined &&
            calcDistance(obj.x, obj.y, gs.fleet.x, gs.fleet.y) <= gs.fleet.mapViewDistance
        const isDiscovered = hasBeenSeen || isInVisionRange
        const hasBeenVisited = gs.lastVisitedDates.has(obj)
        
        let displayName
        if (obj === gs.fleet) {
            displayName = 'You'
        } else if (obj instanceof Planet && !hasBeenVisited) {
            // Planets and stations show as unknown until visited, even if seen
            displayName = obj instanceof SpaceStation ? 'Unknown Station' : `Unknown ${obj.objectType.name}`
        } else if (!isDiscovered && obj.objectType) {
            displayName = `Undiscovered ${obj.objectType.name}`
        } else {
            displayName = coloredName(obj)
        }
        ce({parent:container, tag:'h3', innerHTML: displayName, onClick: ()=>this.selectObject(obj),
            style: {filter: `drop-shadow(1px 0 0 ${colorArrToRgbaString(COLORS.Green)}) drop-shadow(0 1px 0 ${colorArrToRgbaString(COLORS.Green)})  drop-shadow(0 -0.5px 0 ${colorArrToRgbaString(COLORS.Green)})  drop-shadow(-0.5px 0 0 ${colorArrToRgbaString(COLORS.Green)})`}
        })
        //const allPlanets = [...this.starSystem.planets, ...this.starSystem.dwarfPlanets]
        
        // Determine which canvas object to show as image
        let imageObject = null
        if (obj instanceof SpaceStation) {
            imageObject = hasBeenSeen ? this.cvs.getObject(`station${obj.uuid}`) : this.cvs.getObject(`unknown${obj.uuid}`)
        } else if (obj instanceof Planet) {
            imageObject = hasBeenSeen ? this.cvs.getObject(`planet${obj.uuid}`) : this.cvs.getObject(`unknown${obj.uuid}`)
        } else if (obj instanceof Star) {
            imageObject = hasBeenSeen ? this.cvs.getObject(`star${obj.uuid}`) : this.cvs.getObject(`unknown${obj.uuid}`)
        } else if (obj instanceof Fleet) {
            imageObject = this.cvs.getObject(`fleet${obj.uuid}`)
        }
        
        ce({parent:container, style: {margin: 'auto'}, onClick: ()=>this.selectObject(obj), children:[
            imageObject?.asImage(25, COLORS.LightGreen) || null
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
            
            // Display ship status in different formats
            let shipStatusText
            if (disabledShips === 0) {
                shipStatusText = `Ships: ${totalShips}`
            } else if (disabledShips === totalShips) {
                shipStatusText = `Ships: ${totalShips} disabled`
            } else {
                shipStatusText = `Ships: ${activeShips}/${totalShips} active`
            }
            ce({parent:container, innerHTML: shipStatusText})
            ce({parent:container, innerHTML:`Hull: ${statColorSpan(roundToPlaces(totalHullPercent, 1) + '%', totalHullPercent / 100)}`})
            
            // Add Travel button for non-player fleets
            if (obj !== gs.fleet) {
                const distance = roundToPlaces(calcDistance(gs.fleet.x, gs.fleet.y, obj.x, obj.y), 2)
                ce({parent:container, innerHTML:`Distance: ${distance} AU`})
                
                // Create test route to check if interception is possible
                // Use InterceptionRoute for moving fleets, regular Route for destroyed/abandoned
                const testRoute = obj.destroyed ? new Route(gs.fleet, obj, gs.year) : new InterceptionRoute(gs.fleet, obj, gs.year)
                if (testRoute.valid) {
                    const travelTime = testRoute.travelTime
                    const etaYears = travelTime
                    ce({parent:container, innerHTML:`ETA: ${statColorSpan(describeTimespan(travelTime), 1/(1+etaYears*12))}`})
                    // Abandoned (destroyed) fleets use "Travel" instead of "Intercept"
                    const buttonText = obj.destroyed ? 'Travel' : 'Intercept'
                    ce({parent:container, tag:'button', innerHTML:buttonText, onClick:()=>this.setDestination(obj, true), disabled: gs.fleet.stranded})
                } else {
                    ce({parent:container, innerHTML:`Cannot intercept (too fast)`})
                }
            }
        }
        if (obj == gs.fleet) {
            if (gs.location) ce({parent:container, tag:'button', innerHTML:`Dock (${coloredName(gs.location)})`, onClick:()=>this.explore(gs.location)})
            
            // Check if player is near an asteroid for mining
            const nearbyData = checkNearbyAsteroid()
            if (nearbyData) {
                ce({parent:container, tag:'button', innerHTML:'⛏️ Mine', onClick: () => startMining()})
            }
        }
        if (obj instanceof Planet) {
            const distance = roundToPlaces(calcDistance(gs.fleet.x, gs.fleet.y, obj.x, obj.y), 2)
            const travelTime = distance / gs.fleet.speed
            const etaYears = travelTime
            ce({parent:container, innerHTML:`Distance: ${distance} AU`})
            ce({parent:container, innerHTML:`ETA: ${statColorSpan(describeTimespan(travelTime), 1/(1+etaYears*12))}`})
            // Only show scan/dock button if planet is discovered
            if (isDiscovered) {
                ce({parent:container, tag:'button', innerHTML:isDockedHere ? 'Dock' : 'Scan', onClick:()=>this.explore(obj)})
            }
            ce({parent:container, tag:'button', innerHTML:'Travel', onClick:()=>this.setDestination(obj, true), disabled: cantTravelHere})
            if (gs.fleet.route) ce({parent:container, tag:'button', innerHTML:'Stop', onClick:()=>this.stopPlayerFleet()})
        }
        if (obj instanceof Star) {
            ce({parent:container, tag:'button', innerHTML:'View Star', onClick:()=>this.explore(obj)})
        }
        // Handle waypoint (arbitrary coordinates)
        if (obj.isWaypoint) {
            const distance = roundToPlaces(calcDistance(gs.fleet.x, gs.fleet.y, obj.x, obj.y), 2)
            const travelTime = distance / gs.fleet.speed
            ce({parent:container, innerHTML:`Distance: ${distance} AU`})
            ce({parent:container, innerHTML:`ETA: ${describeTimespan(travelTime)}`})
            ce({parent:container, tag:'button', innerHTML:'Travel', onClick:()=>this.setDestination(obj, true), disabled: gs.fleet.stranded})
            if (gs.fleet.route) ce({parent:container, tag:'button', innerHTML:'Stop', onClick:()=>this.stopPlayerFleet()})
        }
    }

    stopPlayerFleet() {
        gs.fleet.route = null
        this.refresh()
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

    explore(obj) {
        if (obj instanceof Planet) showPlanetMenu(obj)
        if (obj instanceof Star) showStarMenu(obj)
    }

    /** @param {Planet | Waypoint | Fleet} obj */
    setDestination(obj, unpause = false, bypassSunWarning = false) {
        let route = null
        
        if (obj instanceof Planet) {
            route = new Route(gs.fleet, obj)
        } else if (obj instanceof Fleet) {
            // Abandoned (destroyed) fleets use normal Route, active fleets use InterceptionRoute
            route = obj.destroyed ? new Route(gs.fleet, obj) : new InterceptionRoute(gs.fleet, obj)
            if (!route.valid) {
                console.log('!!!! Cannot intercept fleet - target is too fast or too far')
                return
            }
            if (obj instanceof Fleet && !obj.destroyed) unpause = false //these routes can be wonky, so player needs to confirm
        } else if (obj.isWaypoint) {
            // Create a route to arbitrary coordinates
            route = new Route(gs.fleet, obj)
        }
        
        // Check if route intersects the sun
        if (route && FleetAI.checkRouteIntersectsSun(route)) {
            if (!bypassSunWarning) {
                // Warn player and require confirmation
                const targetName = obj.name || 'waypoint'
                showModal(
                    '⚠️ Dangerous Route',
                    ce({
                        children: [
                            ce({ innerHTML: `Your route to ${targetName} passes dangerously close to the sun's core.` }),
                            ce({ innerHTML: 'This path is extremely hazardous. Do you want to proceed anyway?' })
                        ]
                    }),
                    [
                        ['Cancel', () => closeModal()],
                        ['Proceed', () => {
                            closeModal()
                            this.setDestination(obj, unpause, true)
                        }]
                    ]
                )
                return
            }
        }
        
        // Set the route
        if (route) {
            gs.fleet.startRoute(route)
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
        gs.system.updateRoutes(gs.year)
        gs.system.updatePositions()
        
        // Update discoveries every 30 ticks
        this.tickCounter++
        if (this.tickCounter >= 30) {
            gs.system.updateDiscoveries()
            this.tickCounter = 0
        }

        this.refreshInfoBar()
        this.handleCanvasObjects()
        
        // Animate waypoint marker (runs every frame)
        this.fleetsHandler.animateWaypoint()

        //pause if player reached his destination
        if (!playerWasDocked && gs.location) {
            console.log('pausing since player reached destination')
            showPlanetMenu(gs.location)
            return
        }

        // Check for collision-based encounters
        if (checkForCollisionEncounter()) return

        checkForEvents(elapsedYears)

        // Only continue animation loop if not paused
        if (!this.paused) {
            requestAnimationFrame(()=>this.tick())
        }
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

