
/**
 * @param {StarSystem} starSystem
 * @param {Fleet|Planet} autoSelectObject
 * 
 */
class StarMap {
    constructor(starSystem = new StarSystem(), autoSelectObject) {
        console.log('CREATING STAR MAP FOR SYSTEM:',starSystem,'with autoselect obj:',autoSelectObject)
        this.starSystem = starSystem

        this.gameYearsPerMs = STAR_MAP_YEARS_PER_MS
        this.frameCounter = 0 // Track frames for optimizing recoloring
        this.lastPlayerX = gs.fleet ? gs.fleet.x : 0
        this.lastPlayerY = gs.fleet ? gs.fleet.y : 0
        this.lastCameraX = 0
        this.lastCameraY = 0
        this.lastZoom = 1
        this.isAnimating = true
        this.maxMsPerTick = 60;
        
        // FPS tracking
        this.fpsFrames = 0
        this.fpsLastTime = performance.now()
        this.currentFPS = 0

        this.initializeDOM(this.starSystem.radius*4, this.starSystem.radius*0.4, this.starSystem.radius*40, this.starSystem.radius*1)
        this.renderBackgroundStars()
        
        // Create debug panel
        this.debugPanel = ce({parent: this.root, style:{position:'absolute', bottom: 0, right: 0}})

        // Initialize handlers
        this.bodiesHandler = new StarMapBodiesHandler(this)

        this.handleCanvasObjects()
        this.refresh()
        this.selectObject(autoSelectObject || gs.fleet)
        if (StarMap.lastZoom) this.adjustZoom(StarMap.lastZoom/this.cvs.zoom)
        
        // Add spotlight overlay to darken stars outside view range
        this.createSpotlight()
        
        // Start continuous background star update loop (runs even when paused)
        this.animate()
        
        // REMOVED: FleetAI references
        // Set starMap reference for all fleet AIs
        // this.fleetsHandler.updateFleetAIReferences()
    }
    
    createSpotlight() {
        if (!gs.fleet || !gs.fleet.mapViewDistance) {
            console.warn('⚠️ Cannot create spotlight: no fleet or mapViewDistance');
            return;
        }
        
        const spotlightId = 'spotlight'
        const x = gs.fleet.x
        const y = gs.fleet.y
        const radius = gs.fleet.mapViewDistance
        
        console.log('🔦 Creating spotlight with fleet data:');
        console.log('  - Fleet position:', { x, y });
        console.log('  - Fleet totalRadar:', gs.fleet.totalRadar);
        console.log('  - Fleet mapViewDistance:', radius, 'AU');
        console.log('  - STAR_MAP_AVERAGE_VIEW_DISTANCE:', STAR_MAP_AVERAGE_VIEW_DISTANCE);
        console.log('  - AVERAGE_SHIP_RADARS:', AVERAGE_SHIP_RADARS);
        console.log('  - Calculation: 0.5 +', STAR_MAP_AVERAGE_VIEW_DISTANCE, '*', gs.fleet.totalRadar, '/', AVERAGE_SHIP_RADARS, '=', radius);
        
        this.spotlight = this.overlayCvs.addClearCircle(spotlightId+'rect', 0, 0, 0, 0)
        
        console.log('🔦 Spotlight created:', this.spotlight);
    }
    
    updateSpotlight() {
        if (!this.spotlight || !gs.fleet || !gs.fleet.mapViewDistance) return
        // Update spotlight position to follow player
        this.spotlight.x = gs.fleet.x
        this.spotlight.y = gs.fleet.y
        this.spotlight.size = gs.fleet.mapViewDistance
        this.spotlight.minorSize = gs.fleet.mapViewDistance
        this.overlayCvs.cameraX = this.cvs.cameraX
        this.overlayCvs.cameraY = this.cvs.cameraY
        this.overlayCvs.zoom = this.cvs.zoom
    }

    /**
     * Initialize DOM with background canvas layer under main canvas
     */
    initializeDOM(baseZoom, minZoom, maxZoom, cameraPanLimit) {
        this.bgCvs = new CanvasWrapper('starmap-background-map-canvas', baseZoom, minZoom, maxZoom, cameraPanLimit)
        this.bgCvs.canvas.style.pointerEvents = 'none' // Don't capture mouse events
        
        // Create main canvas
        this.cvs = new CanvasWrapper('starmap-main-map-canvas', baseZoom, minZoom, maxZoom, cameraPanLimit)
        
        // Create overlay canvas for spotlight (between background and main)
        this.overlayCvs = new CanvasWrapper('starmap-overlay-map-canvas', baseZoom, minZoom, maxZoom, cameraPanLimit)
        this.overlayCvs.fillColor = 'rgba(0, 0, 0, 0.5)' // Semi-transparent black

        this.overlayCvs.root.style.pointerEvents = 'none' // Don't capture mouse events on container
        this.overlayCvs.canvas.style.pointerEvents = 'none' // Don't capture mouse events on canvas
        
        // Build DOM structure with three layers: bg -> overlay -> main
        this.root = ce({classNames: ['starmap-root'], children: [
            this.bgCvs.root,      // Background layer (stars - rendered first/below)
            this.overlayCvs.root, // Overlay layer (fog of war - dims stars only)
            this.cvs.root         // Main layer (game objects - on top, not dimmed)
        ]})
        this.controls = ce({parent: this.root, style: {position: 'absolute', top: 0, left: 0}})
        this.infoBar = ce({parent: this.root, style:{position:'absolute', bottom: 0, left: 0}})
        this.fuelBar = ce({parent: this.root, style:{position:'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)'}})
        this.pausedIndicator = ce({
            parent: this.root,
            innerHTML: 'PAUSED',
            classNames: ['paused-indicator']
        })
        this.objectPane = ce({parent: this.root, style: {position: 'absolute', top: 0, right: 0, height: '100%', pointerEvents: 'none'}})
        
        window.addEventListener("resize", () => {
            this.cvs.autoResize()
            this.bgCvs.autoResize()
            this.overlayCvs.autoResize()
            // Re-render background stars when canvas size changes
            this.renderBackgroundStars()
        })
        
        // Deferred initialization
        requestAnimationFrame(()=> requestAnimationFrame(()=>{
            this.cvs.autoResize()
            this.bgCvs.autoResize()
            this.overlayCvs.autoResize()
            this.onDeferredInit()
        }))
    }
    
    /**
     * Render background stars to background canvas (called once on init and on resize)
     */
    renderBackgroundStars() {
        const {width, height} = this.bgCvs.canvas
        
        // Add bitmap background if not already present
        const bgId = 'starmap-background'
        if (!this.bgCvs.getObject(bgId)) {
            const canvasSize = Math.max(width, height) / this.bgCvs.pixelRatio
            const bmp = this.bgCvs.addBitmap(
                bgId,
                0, 0,
                BACKGROUNDS.STARFIELD_1.src,
                canvasSize*8, // Size to cover canvas
                0,
                null,
                0,
                null,
                -1000, // Behind everything
                true, // parallax = true (immune to zoom)
                true  // overlap = true (covers at least the available space)
            )
            console.log('Created starmap background bitmap',bmp)
        }
    }

    static lastZoom = 1

    animate() {
        // Check if animation should continue
        if (!this.isAnimating) {
            console.log('StarMap animation loop stopped')
            return
        }
        
        this.frameCounter++
        
        // Track FPS
        this.fpsFrames++
        const currentTime = performance.now()
        if (currentTime - this.fpsLastTime >= 1000) {
            this.currentFPS = Math.round(this.fpsFrames * 1000 / (currentTime - this.fpsLastTime))
            this.fpsFrames = 0
            this.fpsLastTime = currentTime
            this.refreshDebugPanel()
        }
        
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
            
            // Update decorators when camera changes (especially zoom)
            this.bodiesHandler.updateAllDecorators()
        }
        
        // Update asteroids every 600th frame when player is in motion
        if (playerInMotion && this.frameCounter % 600 === 0) {
            if (STARMAP_DEBUG_CONFIG.displayAsteroids) this.bodiesHandler.handleAsteroids()
        }
        
        // Update ETA displays every 60 frames
        if (this.frameCounter % 30 === 0) {
            this.updateETADisplays()
        }
        
        // Update spotlight position every frame to follow player
        this.updateSpotlight()
        
        // Update player location indicator animation (runs even when paused)
        this.bodiesHandler.handlePlayerLocationIndicator()
        
        // Redraw main canvas (background canvas is static and doesn't need redraw)
        this.cvs.redraw(true)
        
        // Redraw overlay canvas with spotlight

        this.overlayCvs.redraw(true)
        
        // Continue animation loop
        requestAnimationFrame(() => this.animate())
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
                ce({tag:'button', classNames: [(this.paused && !gs.fleet.route) || (!this.paused && gs.location) ? 'highlighted' : null] , innerHTML:this.paused ? '▶' : '⏸', onClick: () => this.togglePause()}),
                ce({tag:'button', innerHTML:'+', onClick: () => this.adjustZoom(1.33)}),
                ce({tag:'button', innerHTML:'-', onClick: () => this.adjustZoom(0.66)}),
                ce({tag:'button', classNames: [gs.captain.skillPoints > 0 ? 'highlighted' : null], innerHTML:'🖳', onClick: () => showAssistantMenu()}),
                ce({tag:'button', innerHTML:'☰', onClick: () => this.handleSaveGame()}),
            ]
        })
    }

    refreshInfoBar() {
        console.log('1')
        const {fleet, year} = gs
        const {location, route} = fleet
        const destination = route?.destination
        const distance = roundToPlaces(route?.path.distance, 1)
        const endYear = route?.endYear
        const yearsRemaining = describeTimespan(endYear-year, 1)

        console.log(yearsRemaining,endYear,year)

        /** @param {SpaceObject} destination */
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
                        ` | Distance: `,
                        this.infoBarDistanceEl = ce({id: 'star_map_distance_info_bar', innerHTML: `${distance} AU`}),
                        ` | ETA: `,
                        this.infoBarETAEl = ce({id: 'star_map_eta_info_bar', innerHTML: yearsRemaining}),
                        ` | Fuel Cost: `,
                        this.infoBarFuelCostEl = ce({id: 'star_map_fuel_cost_info_bar', innerHTML: `${roundToPlaces(distance * FUEL_COST_PER_1_AU, 1)}`})
                    ]
                })
                : location ? destinationLink(location)
                : '(Space)',
            ]
        })
        
        // Clear references if no destination
        if (!destination) {
            this.infoBarDistanceEl = null
            this.infoBarETAEl = null
            this.infoBarFuelCostEl = null
        }
        
        // Update fuel bar
        this.refreshFuelBar()
    }
    
    refreshFuelBar() {
        const {fleet} = gs
        
        this.fuelBar.innerHTML = ''
        
        // If no ships, show warning instead of fuel bar
        if (fleet.ships.length === 0) {
            ce({
                parent: this.fuelBar,
                style: {color: '#ffdd00', fontWeight: 'bold'},
                innerHTML: '(NO SHIPS)'
            })
            return
        }
        
        const fuelPercentage = (fleet.fuel / fleet.totalFuelCapacity) * 100
        
        // Calculate color ratio: 4.0 at 100% fuel, 1.0 at 50% fuel, 0.0 at 0% fuel
        const colorRatio = fuelPercentage / 25
        const fuelBarColor = calcStatColor(colorRatio)
        
        ce({
            parent: this.fuelBar,
            style: {display: 'flex', gap: '6px', alignItems: 'center'},
            children: [
                'Fuel: ',
                new ProgressBar({
                    value: fuelPercentage,
                    fillColor: fuelBarColor,
                    overrideLabel: '',
                    width: 25
                }).container,
            ]
        })
    }
    
    refreshDebugPanel() {
        this.debugPanel.innerHTML = ""
        ce({
            parent: this.debugPanel,
            classNames: ['starmap-info-bar'],
            children: [
                `FPS: ${this.currentFPS}`
            ]
        })
    }
    
    updateETADisplays() {
        const {fleet, year} = gs
        const {route} = fleet
        
        // Update info bar distance, ETA, and fuel cost using stored references
        if (route && this.infoBarDistanceEl && this.infoBarETAEl && this.infoBarFuelCostEl) {
            const distance = roundToPlaces(route.path.distance, 1)
            const endYear = route.endYear
            const yearsRemaining = describeTimespan(endYear - year, 1)
            const fuelCost = roundToPlaces(distance * FUEL_COST_PER_1_AU, 1)
            
            this.infoBarDistanceEl.textContent = `${distance} AU`
            this.infoBarETAEl.textContent = yearsRemaining
            this.infoBarFuelCostEl.textContent = `${fuelCost}`
        }
        
        // Update object pane distance, ETA, and fuel cost using stored references
        const obj = this.selectedObject
        if (obj && obj !== gs.fleet && this.objPaneDistanceEl && this.objPaneETAEl && this.objPaneFuelCostEl) {
            if (obj.x !== undefined && obj.y !== undefined) {
                const distance = roundToPlaces(calcDistance(gs.fleet.x, gs.fleet.y, obj.x, obj.y), 1)
                const travelTime = distance / gs.fleet.speed
                const fuelCost = distance * FUEL_COST_PER_1_AU
                const fuelPercent = gs.fleet.totalFuelCapacity > 0 ? (fuelCost / gs.fleet.totalFuelCapacity) * 100 : 0
                
                // Calculate max distance based on available fuel
                const maxDistance = gs.fleet.totalFuelCapacity / FUEL_COST_PER_1_AU
                // Ratio: 0.0 at 0 distance, 4.0 at max distance
                const ratio = maxDistance > 0 ? ((maxDistance-distance) / maxDistance) : 0
                
                // Update distance
                this.objPaneDistanceEl.innerHTML = statColorSpan(`${roundToPlaces(distance, 1)} AU`, ratio)
                
                // Update fuel cost
                this.objPaneFuelCostEl.innerHTML = statColorSpan(`${roundToPlaces(fuelPercent, 1)}%`, ratio)
                
                // Update ETA
                if (obj instanceof Planet) {
                    const timespan = describeTimespan(travelTime, 1)
                    this.objPaneETAEl.innerHTML = statColorSpan(timespan, ratio)
                }
            }
        }
    }
    
    handleCanvasObjects() {
        this.bodiesHandler.handleAll()
        // Note: cvs.redraw() is called by the animation loops (animateBackgroundStars/tick)
        // Don't redraw here or we'll redraw twice per frame
    }

    refreshObjectPane() {
        this.objectPane.innerHTML = '';
        const obj = this.selectedObject
        if (!obj) {
            this.objectPane.textContent = '(Select an object on the map.)';
            return;
        }
        const isDockedHere = obj == gs.location
        //const cantTravelHere = (obj == gs.location) || gs.fleet.stranded
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
        } else if (obj instanceof Planet) {
            // Use descriptor property for planets/stations
            if (!hasBeenVisited) {
                displayName = obj.descriptor
            } else {
                displayName = coloredName(obj)
            }
        } else if (!isDiscovered && obj.objectType) {
            displayName = `Undiscovered ${obj.objectType.name}`
        } else {
            displayName = coloredName(obj)
        }
        
        // Override display name for out-of-range fleets
        if (obj instanceof Fleet && obj !== gs.fleet && gs.fleet && gs.fleet.mapViewDistance) {
            const distanceToPlayer = calcDistance(obj.x, obj.y, gs.fleet.x, gs.fleet.y)
            if (distanceToPlayer > gs.fleet.mapViewDistance) {
                displayName = '<span style="color: ' + colorArrToRgbaString(COLORS.Yellow) + '">Unknown Object</span>'
            }
        }
        
        ce({parent:container, tag:'h3', innerHTML: displayName, onClick: ()=>this.selectObject(obj),
            style: {filter: `drop-shadow(1px 0 0 ${colorArrToRgbaString(COLORS.Green)}) drop-shadow(0 1px 0 ${colorArrToRgbaString(COLORS.Green)})  drop-shadow(0 -0.5px 0 ${colorArrToRgbaString(COLORS.Green)})  drop-shadow(-0.5px 0 0 ${colorArrToRgbaString(COLORS.Green)})`}
        })
        //const allPlanets = [...this.starSystem.planets, ...this.starSystem.dwarfPlanets]
        
        // Determine which canvas object to show as image
        // Show real colors/decorators if object has been seen, even if not visited
        let imageObject = null
        if (obj instanceof SpaceStation) {
            const mainObj = this.cvs.getObject(`station${obj.uuid}`)
            const unknownObj = this.cvs.getObject(`unknown${obj.uuid}`)
            imageObject = (hasBeenSeen && mainObj?.visible) ? mainObj : unknownObj
        } else if (obj instanceof Planet) {
            // Show actual planet appearance with colors and decorators if it's been seen
            const mainObj = this.cvs.getObject(`planet${obj.uuid}`)
            const unknownObj = this.cvs.getObject(`unknown${obj.uuid}`)
            imageObject = (hasBeenSeen && mainObj?.visible) ? mainObj : unknownObj
        } else if (obj instanceof Star) {
            const mainObj = this.cvs.getObject(`star${obj.uuid}`)
            const unknownObj = this.cvs.getObject(`unknown${obj.uuid}`)
            imageObject = (hasBeenSeen && mainObj?.visible) ? mainObj : unknownObj
        }
        
        // Check if fleet is out of radar range
        let isFleetOutOfRange = false
        if (obj instanceof Fleet && obj !== gs.fleet && gs.fleet && gs.fleet.mapViewDistance) {
            const distanceToPlayer = calcDistance(obj.x, obj.y, gs.fleet.x, gs.fleet.y)
            isFleetOutOfRange = distanceToPlayer > gs.fleet.mapViewDistance
        }
        
        // Don't show image for out-of-range fleets
        if (!isFleetOutOfRange) {
            ce({parent:container, style: {margin: 'auto'}, onClick: ()=>this.selectObject(obj), children:[
                imageObject?.asImage(25, COLORS.LightGreen) || null
            ]})
        }
        
        if (obj instanceof Fleet) {
            // For out-of-range fleets, only show distance and don't show detailed stats or actions
            if (isFleetOutOfRange) {
                const distance = roundToPlaces(calcDistance(gs.fleet.x, gs.fleet.y, obj.x, obj.y), 1)
                ce({parent:container, innerHTML:`Distance: ${distance} AU`})
                ce({parent:container, innerHTML:`<span style="color: ${colorArrToRgbaString(COLORS.Gray)}">Out of radar range</span>`})
            } else {
                // Show normal fleet details for in-range fleets
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
                    const distance = roundToPlaces(calcDistance(gs.fleet.x, gs.fleet.y, obj.x, obj.y), 1)
                    ce({parent:container, innerHTML:`Distance: ${distance} AU`})
                }
            }
        }
        if (obj == gs.fleet) {
            if (gs.location) ce({parent:container, tag:'button', innerHTML:`Dock (${coloredName(gs.location)})`, onClick:()=>this.explore(gs.location)})
        }
        if (obj instanceof Planet) {
            const distance = roundToPlaces(calcDistance(gs.fleet.x, gs.fleet.y, obj.x, obj.y), 1)
            const travelTime = distance / gs.fleet.speed
            const fuelCost = distance * FUEL_COST_PER_1_AU
            const fuelPercent = gs.fleet.totalFuelCapacity > 0 ? (fuelCost / gs.fleet.totalFuelCapacity) * 100 : 0
            
            // Calculate max distance based on available fuel
            const maxDistance = gs.fleet.totalFuelCapacity / FUEL_COST_PER_1_AU
            // Ratio: 0.0 at 0 distance, 4.0 at max distance
            const ratio = maxDistance > 0 ? ((maxDistance-distance) / maxDistance) : 0
            
            const canReach = gs.fleet.canReachDestination(obj)
            
            // Check if route passes too close to sun
            const fliesIntoSun = this.checkFlyIntoSun(obj)
            
            // Check if reachable with full fuel tank
            const reachableWithFullTank = fuelCost <= gs.fleet.totalFuelCapacity
            
            ce({parent:container, children: [
                'Distance: ',
                this.objPaneDistanceEl = ce({id: 'star_map_distance_object_pane', innerHTML: statColorSpan(`${distance} AU`, ratio)})
            ]})
            ce({parent:container, children: [
                'ETA: ',
                this.objPaneETAEl = ce({id: 'star_map_eta_object_pane', innerHTML: statColorSpan(describeTimespan(travelTime, 1), ratio)})
            ]})
            ce({parent:container, style: {display: 'flex'}, children: [
                'Fuel Cost: ',
                fliesIntoSun ? ce({innerHTML: colorSpan('(Can\'t fly into sun)', COLORS.Orange)}) :
                    !canReach ? ce({innerHTML: colorSpan(reachableWithFullTank ? '(Need more fuel)' : '(Too far)', COLORS.Red)}) : 
                        (this.objPaneFuelCostEl = ce({id: 'star_map_fuel_cost_object_pane', innerHTML: statColorSpan(`${roundToPlaces(fuelPercent, 1)}%`, ratio)}))
            ]})
            
            // Only show scan/dock button if planet is discovered
            if (isDiscovered) {
                ce({parent:container, tag:'button', innerHTML:isDockedHere ? 'Dock' : 'Scan', onClick:()=>this.explore(obj)})
            }
            // Hide travel button if this planet is already the destination of the current route
            const isCurrentDestination = gs.fleet.route && gs.fleet.route.destination === obj
            const isAlreadyDockedHere = gs.fleet.location === obj
            if (!isCurrentDestination && !isAlreadyDockedHere) {
                const stranded = gs.fleet.stranded
                const hasEnoughFuel = gs.fleet.fuel >= distance * FUEL_COST_PER_1_AU
                const canTravel = !stranded && hasEnoughFuel && !fliesIntoSun
                ce({parent:container, tag:'button', innerHTML:'Travel', onClick:()=>this.startTravel(obj), disabled: !canTravel})
            }
            if (gs.fleet.route) ce({parent:container, tag:'button', innerHTML:'Stop', onClick:()=>this.stopPlayerFleet()})
        }
        if (obj instanceof Star) {
            ce({parent:container, tag:'button', innerHTML:'View Star', onClick:()=>this.explore(obj)})
        }

    }

    stopPlayerFleet() {
        gs.fleet.route = null
        this.refresh()
    }
    
    /**
     * Checks if a route from current location to destination passes too close to the sun
     * @param {Planet} destination - The destination planet
     * @returns {boolean} True if route passes through dangerous solar proximity
     */
    checkFlyIntoSun(destination) {
        if (!destination || !gs.fleet) return false
        
        // Get the sun (first star in the system)
        const sun = gs.system.stars[0]
        if (!sun) return false
        
        // Use half of Mercury's orbital radius as the danger zone (0.39 AU / 2 = 0.195 AU)
        const dangerRadius = 0.39 / 2
        
        // Create a circle around the sun
        const sunCircle = new Circle(sun.x, sun.y, dangerRadius)
        
        // Check if the line from current position to destination intersects the sun's danger zone
        const intersects = sunCircle.intersectsLine(gs.fleet.x, gs.fleet.y, destination.x, destination.y)
        
        return intersects
    }

    startTravel(destination) {
        if (!destination || !(destination instanceof Planet)) {
            console.error('Invalid travel destination:', destination)
            return
        }

        const distance = calcDistance(gs.fleet.x, gs.fleet.y, destination.x, destination.y)
        const fuelCost = distance * FUEL_COST_PER_1_AU
        
        // Check if fleet has enough fuel
        if (gs.fleet.fuel < fuelCost) {
            console.warn('Not enough fuel to travel to', destination.name)
            return
        }

        // Calculate travel time based on fleet speed
        const travelTime = distance / gs.fleet.speed
        
        // Set travel state
        gs.previousLocation = gs.fleet.location
        gs.destination = destination
        gs.travelYearsRemaining = travelTime
        gs.travelProgress = 0
        gs.travelStartYear = gs.year
        gs.x = gs.fleet.x
        gs.y = gs.fleet.y

        // Deduct fuel cost
        gs.fleet.fuel -= fuelCost

        console.log(`Starting travel to ${destination.name}:`, {
            distance,
            fuelCost,
            travelTime,
            remainingFuel: gs.fleet.fuel
        })

        showTravelMap()
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

    togglePause(newPausedState = !this.paused) {
        console.log('setting paused to:',newPausedState)
        const wasAlreadyUnpaused = !this.paused
        this.paused = newPausedState
        
        // Update paused indicator visibility
        if (this.pausedIndicator) {
            this.pausedIndicator.style.display = this.paused ? 'block' : 'none'
        }
        
        // Only start tick loop if transitioning from paused to unpaused
        // This prevents multiple simultaneous tick loops from rapid clicking
        if (!this.paused && !wasAlreadyUnpaused) {
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
        
        // Check for expired and completed missions
        checkExpiredMissions()
        checkCompletedMissions()
        
        gs.system.updatePositions()
        
        // Update fuel bar every 10 frames
        if (!this.fuelBarCounter) this.fuelBarCounter = 0
        this.fuelBarCounter++
        if (this.fuelBarCounter >= 10) {
            this.refreshFuelBar()
            this.fuelBarCounter = 0
        }

        this.handleCanvasObjects()
        // Note: Canvas redraw is handled by animateBackgroundStars() which runs continuously

        //pause if player reached his destination
        if (!playerWasDocked && gs.location) {
            console.log('pausing since player reached destination')
            showPlanetMenu(gs.location)
            return
        }

        checkForEvents(elapsedYears)

        // Only continue animation loop if not paused
        if (!this.paused) {
            requestAnimationFrame(()=>this.tick())
        }
    }

    /**
     * Handle saving the game
     */
    handleSaveGame() {
        // Pause the game while in menu
        const wasPaused = this.paused;
        if (!wasPaused) {
            this.togglePause(true);
        }
        
        // Show save/load menu
        showSaveLoadMenu();
        
        // When modal closes, resume if needed
        // Note: Individual menu functions handle their own resume logic
    }

    /**
     * Clean up resources when closing the star map
     */
    cleanup() {
        // Stop animation loop
        this.isAnimating = false
        // Pause any running loops
        this.paused = true;
        console.log('StarMap cleaned up');
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

