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

        this.root = createElement({classNames: ['starmap-root']})
        this.infoBar = createElement({parent: this.root, classNames:['starmap-info']})
        this.controls = createElement({parent: this.root})
        this.main = createElement({parent: this.root, classNames:['starmap-main']})

        this.cvs = new CanvasWrapper(1200, 600, 'black', 100, 10, 1000, NEPTUNE.orbit.radius*2)
        this.leftPane = createElement({parent:this.root, classNames:['starmap-left'], children:[this.cvs.root]})

        this.rightPane = createElement({parent:this.root, classNames:['starmap-right']})

        this.main.appendChild(this.leftPane);
        this.main.appendChild(this.rightPane);

        this.refresh()
    }

    refresh() {
        this.rebuildLeftPaneObjLayer();
        this.refreshControls();
        this.refreshInfoBar();
        this.refreshRightPane();
        this.refreshLeftPaneObjLayer();
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
                createElement({tag:'button', innerHTML:'Dock', onClick: ()=> this.explore(), disabled: (!gameState.fleet.location)}),
                createElement({tag:'button', innerHTML:'Trade Info', onClick: ()=> this.onTradeInfo()})
            ]
        })
    }

    refreshInfoBar() {
        const {fleet, year} = gameState
        const {location, route} = fleet
        const destination = route?.destination
        const distance = round(route?.distance, 2)
        const endYear = route?.endYear
        const yearsRemaining = describeTimespan(endYear-year)

        this.infoBar.innerHTML = ""

        const children = [
            createElement({innerHTML: `Date: ${describeDate(year)}`}),
            createElement({innerHTML: ` | Location: ${location ? coloredName(location, false) : '(Space)'}`, onClick: ()=>this.selectObject(location)}),
            createElement({innerHTML: ` | Destination: ${destination ? coloredName(destination, false) : '(None)'}`, onClick: destination ? ()=>this.selectObject(destination) : undefined}),
            createElement({innerHTML: !destination ? '' : ` | Distance: ${distance} AU`}),
            createElement({innerHTML: !destination ? '' : ` | ETA: ${yearsRemaining}`}),
        ]

        for (const child of children) this.infoBar.appendChild(child)
    }

    rebuildLeftPaneObjLayer() {
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
        
        fleets.forEach((fleet,index)=>{
            console.log('rebuilding a route')
            cvs.addLine(`fleetpath${index}`, 0, 0, 0, 0, fleet.color, 1) 
        })

        stars.forEach((body,index)=>{
            cvs.addFilledCircle(`star${index}`, body.x, body.y, body.radius/EARTH_RADII_PER_AU, 12, body.color, ()=>this.selectObject(body))
        })

        planets.forEach((body,index)=>{
            cvs.addFilledCircle(`planet${index}`, body.x, body.y, body.radius/EARTH_RADII_PER_AU, 8, body.color, ()=>this.selectObject(body))
        })

        fleets.forEach((fleet, index)=>{
            cvs.addTriangle(`fleet${index}`, fleet.x, fleet.y, fleet.radius/EARTH_RADII_PER_AU, 8, fleet.color, fleet.route ? fleet.route.path.angle : -Math.PI/2, ()=>this.selectObject(fleet))
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

    refreshLeftPaneObjLayer() {
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
            const cvsObject = cvs.getObject(`planet${index}`)
            cvsObject.x = body.x
            cvsObject.y = body.y
        })

        fleets.forEach((fleet, index)=>{
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
        })

        cvs.redraw()

        /*if (obj instanceof Fleet) {
            if (obj.location) gfx.classList.remove('starmap-thruster-forward')
            else gfx.classList.add('starmap-thruster-forward')
        }*/
    }

    refreshRightPane() {
        this.rightPane.innerHTML = '';
        if (!this.selectedObject) {
            this.rightPane.textContent = '(Select an object on the map.)';
            return;
        }
        createElement({parent:this.rightPane, tag:'h2', innerHTML: coloredName(this.selectedObject)})
        // Planet-specific actions
        const isDockedHere = this.selectedObject == gameState.fleet.location
        if (this.selectedObject instanceof Planet) {
            createElement({parent:this.rightPane, tag:'button', innerHTML:isDockedHere ? 'Dock' : 'Scan', onClick:()=>this.explore(this.selectedObject)})
            createElement({parent:this.rightPane, tag:'button', innerHTML:'Set Destination', onClick:()=>this.setDestination(this.selectedObject), disabled: (this.selectedObject == gameState.fleet.location)})
            createElement({parent:this.rightPane, tag:'button', innerHTML:'Travel (Unpause)', onClick:()=>this.setDestination(this.selectedObject, true), disabled: (this.selectedObject == gameState.fleet.location)})
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

        this.refreshLeftPaneObjLayer()
        this.refreshInfoBar()

        //pause if player reached his destination
        if (!playerWasDocked && gameState.fleet.location) {
            console.log('pausing since player reached destination')
            this.togglePause(true)
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

