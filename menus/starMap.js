/*
StarMap
ticket speed: 1 hour per real life second
default zoom distances: 1200px = half the size of the solar system
*/
class StarMap {
    constructor(starSystem = new StarSystem(), autoSelectObject = gameState.fleet) {
        this.starSystem = starSystem
        this.selectedObject = autoSelectObject || gameState.fleet;

        this.paused = true
        this.lastTickMs = Date.now()
        this.gameYearsPerMs = 1/365/24/60 * 2

        this.cvs = new CanvasWrapper(100, 10, 1000, NEPTUNE.orbit.radius*2)
        this.root = createElement({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.controls = createElement({parent: this.root, style: {position: 'absolute', top: 0, left: 0}})
        this.infoBar = createElement({parent: this.root, style:{position:'absolute', bottom: 0, left: 0}})
        this.objectPane = createElement({parent: this.root, style: {position: 'absolute', top: 0, right: 0, height: '100%'}})

        this.refresh()

        window.addEventListener("resize", ()=>this.cvs.autoResize());
        setTimeout(()=>{
            this.cvs.autoResize()
        }, 1)
    }

    refresh() {
        this.rebuildCanvas();
        this.refreshControls();
        this.refreshInfoBar();
        this.refreshObjectPane();
        this.refreshCanvas();
    }

    refreshControls() {
        this.controls.innerHTML = ""
        createElement({
            parent:this.controls,
            classNames: ['starmap-buttons'],
            children: [
                createElement({tag:'button', innerHTML:this.paused ? '▶' : '⏸', onClick: () => this.togglePause()}),
                createElement({tag:'button', innerHTML:'+', onClick: () => this.cvs.adjustZoom(1.33)}),
                createElement({tag:'button', innerHTML:'-', onClick: () => this.cvs.adjustZoom(0.66)}),
                createElement({tag:'button', innerHTML:'?', onClick: () => this.openAssistant()}),
            ]
        })
    }

    openAssistant() {
        this.togglePause(true)
        showModal(`Assistant`, 'How can I help you captain?', [
            ['Trade Info', ()=>this.onTradeInfo()],
            ['Cancel', ()=>closeModal()],
        ])
    }

    refreshInfoBar() {
        const {fleet, year} = gameState
        const {location, route} = fleet
        const destination = route?.destination
        const distance = round(route?.distance, 2)
        const endYear = route?.endYear
        const yearsRemaining = describeTimespan(endYear-year)

        const planetLink = (planet = new Planet())=> {
            return createElement({innerHTML: coloredName(planet), onClick: ()=>this.selectObject(planet), style: {color: planet.color}, classNames:['clickable-text']})
        }

        this.infoBar.innerHTML = ""
        createElement({
            parent:this.infoBar,
            classNames: ['starmap-info-bar'],
            children: [
                `${describeDate(year)} | `,
                destination ? createElement({
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
        const {starSystem, cvs} = this
        const {stars, planets, fleets, backgroundStars} = starSystem
        //const routes = [gameState.fleet.route]
        const orbitingBodies = [...stars, ...planets].filter(b=>(b.orbit))

        cvs.clearObjects()

        backgroundStars.forEach( (bgStar, index) => {
            cvs.addDot(`orbit${index}`, bgStar.x, bgStar.y, bgStar.color)
        });

        orbitingBodies.forEach( (orbitingBody, index) => {
            console.log('rebuilding an orbit')
            cvs.addEmptyCircle(`orbit${index}`, orbitingBody.parent.x, orbitingBody.parent.y, orbitingBody.orbit.radius, 1, orbitingBody.color)
        });
        
        stars.forEach((body,index)=>{
            //for fun, make bodies a bit bigger so they're visually different sizes instead of all being min size
            cvs.addFilledCircle(`star${index}`, body.x, body.y, body.radius/EARTH_RADII_PER_AU * 25, 8, body.color, ()=>this.selectObject(body))
        })

        planets.forEach((body,index)=>{
            cvs.addFilledCircle(`planet${index}`, body.x, body.y, body.radius/EARTH_RADII_PER_AU * 150, 4, body.color, ()=>this.selectObject(body))
            cvs.addText(`planetlabel${index}`, body.x, body.y, 0, -32, body.name, body.color, DEFAULT_FONT_SIZE, ()=>this.selectObject(body))
        })

        fleets.forEach((fleet, index)=>{
            const fleetAngle = fleet.route ? fleet.route.path.angle : -Math.PI/2
            cvs.addTriangle(`fleet${index}`, fleet.x, fleet.y, fleet.radius/EARTH_RADII_PER_AU, 12, fleet.color, fleetAngle, ()=>this.selectObject(fleet))
            cvs.addLine(`fleetpath${index}`, 0, 0, 0, 0, fleet.color, 1)
            cvs.addTriangle(`fleetthruster${index}`, fleet.x, fleet.y, fleet.radius/EARTH_RADII_PER_AU*0.5, 6, 'orange', fleetAngle - Math.PI)
            //cvs.addTriangle(`fleetbrakeleft${index}`, fleet.x, fleet.y, fleet.radius/EARTH_RADII_PER_AU*0.5, 6, 'orange', fleetAngle - Math.PI*1/2)
            //cvs.addTriangle(`fleetbrakeright${index}`, fleet.x, fleet.y, fleet.radius/EARTH_RADII_PER_AU*0.5, 6, 'orange', fleetAngle - Math.PI*3/2)
            cvs.addText(`fleetlabel${index}`, fleet.x, fleet.y, 0, -32, fleet.name, fleet.color, DEFAULT_FONT_SIZE,
                ()=>this.selectObject(fleet),
                /*()=>{
                    cvs.getObject(`fleetlabel${index}`).color = 'red'
                    cvs.redraw()
                },
                ()=>{
                    cvs.getObject(`fleetlabel${index}`).color = fleet.color
                    cvs.redraw()
                },*/
            )
        })

        cvs.recalculateDrawOrder()
    }

    refreshCanvas() {
        const {cvs, starSystem} = this
        const {stars, planets, fleets} = starSystem
        const orbitingBodies = [...stars, ...planets].filter(b=>(b.orbit))

        orbitingBodies.forEach( (orbitingBody, index) => {
            const cvsObject = cvs.getObject(`orbit${index}`)
            cvsObject.x = orbitingBody.parent.x
            cvsObject.y = orbitingBody.parent.y
        });

        stars.forEach((body,index)=>{
            const cvsObject = cvs.getObject(`star${index}`)
            cvsObject.x = body.x
            cvsObject.y = body.y
        })

        planets.forEach((body,index)=>{
            let cvsObject = cvs.getObject(`planet${index}`)
            cvsObject.x = body.x
            cvsObject.y = body.y

            Object.assign(cvsObject, {x: body.x, y:body.y})

            cvsObject = cvs.getObject(`planetlabel${index}`)
            cvsObject.x = body.x
            cvsObject.y = body.y
        })

        fleets.forEach((fleet, index)=>{
            const fleetAngle = fleet.route ? fleet.route.path.angle : -Math.PI/2

            let cvsObject = cvs.getObject(`fleet${index}`)
            cvsObject.x = fleet.x
            cvsObject.y = fleet.y

            cvsObject = cvs.getObject(`fleetlabel${index}`)
            cvsObject.x = fleet.x
            cvsObject.y = fleet.y

            cvsObject = cvs.getObject(`fleetpath${index}`)
            if (!fleet.route) cvsObject.visible = false
            else {
                let {startX, startY, endX, endY} = fleet.route.path
                cvsObject.visible = true
                cvsObject.x = startX
                cvsObject.y = startY
                cvsObject.x2 = endX
                cvsObject.y2 = endY
            }

            cvsObject = cvs.getObject(`fleetthruster${index}`)
            if (fleet.location || !fleet.route) {
                cvsObject.visible = false
            }
            else {
                const [screenOffsetX, screenOffsetY] = rotatePoint(10, 0, 0, 0, fleetAngle-Math.PI)
                cvsObject.x = fleet.x
                cvsObject.y = fleet.y
                cvsObject.visible = true
                cvsObject.screenOffsetX = screenOffsetX
                cvsObject.screenOffsetY = screenOffsetY
            }
        })

        cvs.redraw()
    }

    refreshObjectPane() {
        this.objectPane.innerHTML = '';
        if (!this.selectedObject) {
            this.objectPane.textContent = '(Select an object on the map.)';
            return;
        }
        const isDockedHere = this.selectedObject == gameState.fleet.location
        const cantTravelHere = (this.selectedObject == gameState.fleet.location) || gameState.fleet.isStranded()
        const container = createElement({parent:this.objectPane, classNames:['starmap-object-panel']})
        createElement({parent:container, tag:'h3', innerHTML: coloredName(this.selectedObject)})
        if (this.selectedObject == gameState.fleet) {
            if (gameState.fleet.location) createElement({parent:container, tag:'button', innerHTML:`Dock (${coloredName(gameState.fleet.location)})`, onClick:()=>this.explore(gameState.fleet.location)})
        }

        // Planet-specific actions
        if (this.selectedObject instanceof Planet) {
            createElement({parent:container, tag:'button', innerHTML:isDockedHere ? 'Dock' : 'Scan', onClick:()=>this.explore(this.selectedObject)})
            createElement({parent:container, tag:'button', innerHTML:'Travel', onClick:()=>this.setDestination(this.selectedObject, true), disabled: cantTravelHere})
        }
    }

    selectObject(obj) {
        console.log('selected:',obj)
        this.selectedObject = obj;
        this.cvs.moveCameraTo(obj.x, obj.y)
        this.refresh();
    }

    explore(planet = gameState.fleet.location) {
        showPlanetMenu(planet)
    }

    onTradeInfo() {
        showTradeInfoSellMenu()
    }

    setDestination(obj = new SpaceObject(), unpause = false) {
        if (obj instanceof Planet) gameState.fleet.route = new Route(gameState.fleet, obj)
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
        const playerWasDocked = (gameState.fleet.location !== undefined)

        const currentTime = Date.now()
        const elapsedMs = currentTime - this.lastTickMs
        this.lastTickMs = currentTime
        const elapsedYears = elapsedMs * this.gameYearsPerMs;

        gameState.year += elapsedYears
        gameState.system.refreshPositions()

        this.refreshCanvas()
        this.refreshInfoBar()

        //pause if player reached his destination
        if (!playerWasDocked && gameState.fleet.location) {
            console.log('pausing since player reached destination')
            showPlanetMenu(gameState.fleet.location)
            return
        }

        if (!playerWasDocked) { //dont have encounters while docked or tick after launch
            const elapsedDays = elapsedYears*365
            const encounterChance = 1 - Math.pow(1-ENCOUNTER_CHANCE_PER_DAY, elapsedDays)
            const didEncounter = Math.random() < encounterChance
            if (didEncounter) {
                this.togglePause(true)
                startEncounter()
                return
            }
        }
        requestAnimationFrame(()=>this.tick())
    }
}


function showStarMap(autoSelectObject = gameState.fleet) {
    const starMap = new StarMap(gameState.system, autoSelectObject)
    showMap(starMap)
}

