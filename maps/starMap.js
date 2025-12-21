/*
StarMap
ticket speed: 1 hour per real life second
default zoom distances: 1200px = half the size of the solar system
*/
class StarMap {
    constructor(starSystem = new StarSystem(), autoSelectObject = gs.fleet) {
        console.log('CREATING STAR MAP FOR SYSTEM:',starSystem)
        this.starSystem = starSystem
        this.selectedObject = null

        this.paused = true
        this.lastTickMs = Date.now()
        this.gameYearsPerMs = 1/365/24/60 * 2
        this.maxMsPerTick = 100

        this.cvs = new CanvasWrapper(200, 20, 2000, NEPTUNE.orbit.radius)
        this.root = ce({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.controls = ce({parent: this.root, style: {position: 'absolute', top: 0, left: 0}})
        this.infoBar = ce({parent: this.root, style:{position:'absolute', bottom: 0, left: 0}})
        this.objectPane = ce({parent: this.root, style: {position: 'absolute', top: 0, right: 0, height: '100%', pointerEvents: 'none'}})

        for (const bgStar of starSystem.backgroundStars) bgStar.reset()

        this.rebuildCanvas();
        this.refresh()

        window.addEventListener("resize", ()=>this.cvs.autoResize());

        requestAnimationFrame(()=> requestAnimationFrame(()=>{
            this.cvs.autoResize();
            this.refresh();
            this.selectObject(autoSelectObject || gs.fleet)
        }));
    }

    refresh() {
        console.log('STARMAP REFRESH CALLED')
        this.refreshControls();
        this.refreshInfoBar();
        this.refreshObjectPane();
        this.refreshBackground(gs.year)
        this.refreshCanvas(true);
    }

    refreshControls() {
        this.controls.innerHTML = ""
        ce({
            parent:this.controls,
            classNames: ['starmap-buttons'],
            children: [
                ce({tag:'button', innerHTML:this.paused ? '▶' : '⏸', onClick: () => this.togglePause()}),
                ce({tag:'button', innerHTML:'+', onClick: () => this.cvs.adjustZoom(1.33)}),
                ce({tag:'button', innerHTML:'-', onClick: () => this.cvs.adjustZoom(0.66)}),
                ce({tag:'button', innerHTML:'?', onClick: () => this.openAssistant()}),
            ]
        })
    }

    openAssistant() {
        this.togglePause(true)
        showModal(`Assistant`, 'How can I help you captain?', [
            ['Trade Info', ()=>showTradeInfoSellMenu()],
            ['Ships Manifest', ()=>showShipsMenu()],
            ['Cargo Manifest', ()=>showCargoMenu()],
            ['Officer Roster', ()=>showOfficersMenu()],
            ['Captain Overview', ()=>showCaptainMenu()],
            ['Cancel', ()=>closeModal()],
        ])
    }

    refreshInfoBar() {
        const {fleet, year} = gs
        const {location, route} = fleet
        const destination = route?.destination
        const distance = roundToPlaces(route?.distance, 2)
        const endYear = route?.endYear
        const yearsRemaining = describeTimespan(endYear-year)

        const planetLink = (planet = new Planet())=> {
            return ce({innerHTML: coloredName(planet), onClick: ()=>this.selectObject(planet), style: {color: colorArrToRgbaString(planet.color)}, classNames:['clickable-text']})
        }

        this.infoBar.innerHTML = ""
        ce({
            parent:this.infoBar,
            classNames: ['starmap-info-bar'],
            children: [
                `${describeDate(year)} | `,
                destination ? ce({
                    style: {display:'flex', gap:'6px', paddingBottom:'8px'},
                    children: [
                        `→`,
                        planetLink(destination),
                        ` | Distance: ${distance} AU | ETA: ${yearsRemaining}`
                    ]
                })
                : location ? planetLink(location)
                : '(Space)',
            ]
        })
    }

    rebuildCanvas() {
        console.log('REBUILDING STAR MAP CANVAS')
        const {starSystem, cvs} = this
        const {stars, planets, fleets, backgroundStars, asteroids} = starSystem
        //const routes = [gs.fleet.route]
        const orbitingBodies = [...stars, ...planets].filter(b=>(b.orbit))

        cvs.clear()

        backgroundStars.forEach( (bgStar, index) => {
            cvs.addPixel(bgStar.x, bgStar.y, bgStar.color, bgStar.radius)
        });

        asteroids.forEach( (asteroid, index) => {
            cvs.addPixel(asteroid.x, asteroid.y, asteroid.color, asteroid.radius)
        });

        orbitingBodies.forEach( (orbitingBody, index) => {
            console.log('rebuilding an orbit')
            cvs.addEmptyCircle(`orbit${index}`, orbitingBody.parent.x, orbitingBody.parent.y, orbitingBody.orbit.radius, 1, orbitingBody.color, 0.25)
        });
        
        stars.forEach((body,index)=>{
            //for fun, make bodies a bit bigger so they're visually different sizes instead of all being min size
            const starObj = cvs.addFilledCircle(`star${index}`, body.x, body.y, body.radius/EARTH_RADII_PER_AU * 25, 12, body.color, ()=>this.selectObject(body))
        })

        planets.forEach((body,index)=>{
            const planetObj = cvs.addFilledCircle(`planet${index}`, body.x, body.y, body.radius/EARTH_RADII_PER_AU * 150, 8, body.color, ()=>this.selectObject(body))
            const labelObj = cvs.addText(`planetlabel${index}`, body.x, body.y, 0, -32, body.name, body.color, DEFAULT_FONT_SIZE, 2, ()=>this.selectObject(body))
            const objs = [planetObj, labelObj]
            for (const obj of objs) {
                obj.onHover = ()=>{
                    labelObj.visible = true
                    for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                }
                obj.onHoverEnd = ()=>{
                    labelObj.visible = false
                    for (const obj3 of objs) obj3.strokeColor = (body == this.selectedObject) ? COLORS.Green : COLORS.Black
                }
                obj.onHoverEnd()
            }
        })

        fleets.forEach((fleet, index)=>{
            const fleetAngle = fleet.route ? fleet.route.path.angle : -Math.PI/2
            const fleetObj = cvs.addTriangle(`fleet${index}`, fleet.x, fleet.y, fleet.radius/EARTH_RADII_PER_AU, fleet.radius/EARTH_RADII_PER_AU, 12, fleet.color, fleetAngle, ()=>this.selectObject(fleet), true)
            cvs.addLine(`fleetpath${index}`, 0, 0, 0, 0, fleet.color, 1)
            cvs.addTriangle(`fleetthruster${index}`, fleet.x, fleet.y, fleet.radius/EARTH_RADII_PER_AU*0.5, fleet.radius/EARTH_RADII_PER_AU*0.5, 6, COLORS.Orange)
            const labelObj = cvs.addText(`fleetlabel${index}`, fleet.x, fleet.y, 0, -32, fleet.name, fleet.color, DEFAULT_FONT_SIZE, 2, ()=>this.selectObject(fleet),)
            const objs = [fleetObj, labelObj]
            for (const obj of objs) {
                obj.onHover = ()=>{
                    labelObj.visible = true
                    for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                }
                obj.onHoverEnd = ()=>{
                    labelObj.visible = false
                    for (const obj3 of objs) obj3.strokeColor = (fleet == this.selectedObject) ? COLORS.Green : COLORS.Black
                }
                obj.onHoverEnd()
            }
        })

        cvs.recalculateDrawOrder()
    }

    refreshCanvas(forceRedraw = true) {
        const {cvs, starSystem} = this
        const {stars, planets, fleets, asteroids} = starSystem
        const orbitingBodies = [...stars, ...planets].filter(b=>(b.orbit))

        orbitingBodies.forEach( (orbitingBody, index) => {
            const cvsObject = cvs.getObject(`orbit${index}`)
            cvsObject.x = orbitingBody.parent.x
            cvsObject.y = orbitingBody.parent.y
        });

        stars.forEach((body,index)=>{
            const cvsObject = cvs.getObject(`star${index}`)
            if (body == this.selectedObject) cvsObject.strokeColor = COLORS.Green
            cvsObject.x = body.x
            cvsObject.y = body.y
        })

        planets.forEach((body,index)=>{
            let cvsObject = cvs.getObject(`planet${index}`)
            cvsObject.x = body.x
            cvsObject.y = body.y

            Object.assign(cvsObject, {x: body.x, y:body.y})

            cvsObject = cvs.getObject(`planetlabel${index}`)
            if (body == this.selectedObject) cvsObject.strokeColor = COLORS.Green
            cvsObject.x = body.x
            cvsObject.y = body.y
        })

        fleets.forEach((fleet, index)=>{
            const fleetAngle = fleet.route ? fleet.route.path.angle : -Math.PI/2

            let cvsObject = cvs.getObject(`fleet${index}`)
            if (fleet == this.selectedObject) cvsObject.strokeColor = COLORS.Green
            cvsObject.x = fleet.x
            cvsObject.y = fleet.y
            cvsObject.angle = fleetAngle

            cvsObject = cvs.getObject(`fleetlabel${index}`)
            if (fleet.location || !fleet.route) {
                cvsObject.visible = false
            }
            else {
                cvsObject.visible = true
                cvsObject.x = fleet.x
                cvsObject.y = fleet.y
            }

            cvsObject = cvs.getObject(`fleetpath${index}`)
            if (!fleet.route) cvsObject.visible = false
            else {
                let {startX, startY, toX, toY} = fleet.route.path
                cvsObject.visible = true
                cvsObject.x = startX
                cvsObject.y = startY
                cvsObject.x2 = toX
                cvsObject.y2 = toY
            }

            cvsObject = cvs.getObject(`fleetthruster${index}`)
            if (fleet.location || !fleet.route) {
                cvsObject.visible = false
            }
            else {
                const [screenOffsetX, screenOffsetY] = rotatePoint(10, 0, 0, 0, fleetAngle-Math.PI)
                cvsObject.angle = fleetAngle - Math.PI
                cvsObject.visible = true
                cvsObject.x = fleet.x
                cvsObject.y = fleet.y
                cvsObject.screenOffsetX = screenOffsetX
                cvsObject.screenOffsetY = screenOffsetY
            }
        })

        cvs.redraw(forceRedraw)
    }

    refreshBackground(year = 0) {
        const {starSystem, cvs} = this
        const {backgroundStars, asteroids} = starSystem
        backgroundStars.forEach( (bgStar, index) => {
            bgStar.twinkle(year)
            cvs.pixels[index].a = bgStar.a
        });
        const numBackgroundStars = backgroundStars.length
        asteroids.forEach( (asteroid, index) => {
            const pixel = cvs.pixels[numBackgroundStars + index]
            pixel.x = asteroid.x
            pixel.y = asteroid.y
        });
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
        const cvsId = obj instanceof Planet ? `planet${this.starSystem.planets.indexOf(obj)}`
            : obj instanceof Star ? `star${this.starSystem.stars.indexOf(obj)}` 
            : obj instanceof Fleet ? `fleet${this.starSystem.fleets.indexOf(obj)}`
            : ''
        ce({parent:container, style: {margin: 'auto'}, onClick: ()=>this.selectObject(obj), children:[
            this.cvs.getObject(cvsId)?.asImage(25, COLORS.LightGreen) || null
        ]})
        if (obj == gs.fleet) {
            if (gs.location) ce({parent:container, tag:'button', innerHTML:`Dock (${coloredName(gs.location)})`, onClick:()=>this.explore(gs.location)})
        }
    if (obj instanceof Planet) {
            ce({parent:container, tag:'button', innerHTML:isDockedHere ? 'Dock' : 'Scan', onClick:()=>this.explore(obj)})
            ce({parent:container, tag:'button', innerHTML:'Travel', onClick:()=>this.setDestination(obj, true), disabled: cantTravelHere})
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
        showPlanetMenu(planet)
    }

    setDestination(obj = new SpaceObject(), unpause = false) {
        if (obj instanceof Planet) gs.fleet.route = new Route(gs.fleet, obj)
        if (unpause) this.togglePause(false)
        else this.refresh()
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
        gs.system.refreshPositions()

        this.refreshBackground(gs.year)
        this.refreshInfoBar()
        this.refreshCanvas()

        //pause if player reached his destination
        if (!playerWasDocked && gs.location) {
            console.log('pausing since player reached destination')
            showPlanetMenu(gs.location)
            return
        }

        checkForEvents(elapsedYears)

        requestAnimationFrame(()=>this.tick())
    }
}


function showStarMap(autoSelectObject = gs.fleet) {
    const starMap = new StarMap(gs.system, autoSelectObject)
    showMap(starMap)
}

