// Star Map using a class instead of a single function

class StarMap {
    constructor(starSystem = new StarSystem(), autoSelectObject = gameState.fleet) {
        this.starSystem = starSystem
        this.selectedObject = autoSelectObject || gameState.fleet;

        this.zoom = 100; //default zoom = 1 px = 1 au
        this.mapWidth = 1200
        this.mapHeight = 600
        this.minZoom = 1
        this.maxZoom = 5000*1000*1000
        this.noOrbitsAtZoom = 5000
        this.paused = true
        this.yearsPerTick = 1/4/24/365 //15 minutes per tick
        this.msPerTick = 250

        this.root = createElement({classNames: ['starmap-root']})
        this.infoBar = createElement({parent: this.root, classNames:['starmap-info']})
        this.controls = createElement({parent: this.root})
        this.main = createElement({parent: this.root, classNames:['starmap-main']})

        this.leftPane = createElement({parent:this.root, classNames:['starmap-left']})
        this.leftPane.style.width = this.mapWidth+'px';
        this.leftPane.style.height = this.mapHeight+'px';

        this.rightPane = createElement({parent:this.root, classNames:['starmap-right']})

        this.main.appendChild(this.leftPane);
        this.main.appendChild(this.rightPane);

        this.refresh()
    }

    refresh() {
        this.rebuildLeftPane();
        this.refreshControls();
        this.refreshInfoBar();
        this.refreshRightPane();
        this.refreshLeftPane();
    }

    refreshControls() {
        this.controls.innerHTML = ""
        createElement({
            parent:this.controls,
            classNames: ['starmap-buttons'],
            children: [
                createElement({tag:'button', innerHTML:this.paused ? '▶' : '⏸', onClick: () => this.togglePause()}),
                createElement({tag:'button', innerHTML:'+', onClick: () => this.adjustZoom(1.33)}),
                createElement({tag:'button', innerHTML:'-', onClick: () => this.adjustZoom(0.66)}),
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

        this.infoBar.innerHTML = ''
        createElement({
            parent:this.infoBar,
            style: {
                display: 'flex',
                gap: '8px'
            },
            children: [
                createElement({innerHTML: `Date: ${describeDate(year)}`}),
                createElement({innerHTML: ` | Location: ${location ? coloredName(location, false) : '(Space)'}`, onClick: ()=>this.selectObject(location)}),
                createElement({innerHTML: ` | Destination: ${destination ? coloredName(destination, false) : '(None)'}`, onClick: destination ? ()=>this.selectObject(destination) : undefined}),
                createElement({innerHTML: !destination ? '' : ` | Distance: ${distance} AU`}),
                createElement({innerHTML: !destination ? '' : ` | ETA: ${yearsRemaining}`}),
            ]
        })
    }

    rebuildLeftPane() {
        const {starSystem, leftPane} = this
        const {stars, planets, fleets} = starSystem
        const objects = [...stars, ...planets, ...fleets];

        //draw orbits
        const orbits = []
        for (const obj of objects) {
            if (obj.orbit) orbits.push([obj, obj.orbit])
        }

        leftPane.innerHTML = ""

        orbits.forEach( ([obj, orbit], index) => {
            const id = `orbit${index}`
            console.log('rebuilding an orbit')
            const color = obj.graphics?.color || '#ffffff'
            createElement({
                id,
                parent: leftPane,
                classNames: ['starmap-orbit'],
                style: {
                    borderColor: color
                },
            })
        });
        
        //draw routes
        const routes = [gameState.fleet.route]
        routes.forEach((route,index)=>{
            if (!route) return
            const id = `route${index}`
            console.log('rebuilding a route')
            const color = route.fleet.graphics?.color || '#ffffff'
            let {angleDeg} = route
            createElement({
                id,
                parent: leftPane,
                classNames: ['starmap-line'],
                style: {
                    backgroundColor: color,
                    transform: `rotate(${angleDeg}deg)`
                },
            })
        })

        //draw objects
        objects.forEach((obj,index) => {
            //if (obj.location) return //dont display docked fleets
            const objIsFleet = obj instanceof Fleet
            const id = `obj${index}`
            const wrapperId = `wrapper${index}`
            console.log('rebuilding an obj')
            const color = obj.graphics?.color || '#ffffff'
            createElement({
                id: wrapperId,
                parent: leftPane,
                classNames: ['starmap-object'],
                onClick: ()=>this.selectObject(obj),
                children: [
                    !objIsFleet ? 
                        createElement({id, classNames: ['starmap-circle'], style: {background: color}})
                        : createElement({
                            id,
                            classNames: ['starmap-ship'],
                            style: {
                                color: color,
                                transform: `rotate(${(obj.route ? obj.route.angleDeg : 0)+135}deg)`
                            }
                        }),
                    !(obj instanceof Fleet) || obj.location == undefined ?
                        createElement({classNames: ['starmap-label'], innerHTML: coloredName(obj)})
                        : null
                ]
            })
        })
    }

    refreshLeftPane() {
        const {zoom, mapWidth, mapHeight, selectedObject, starSystem, leftPane, noOrbitsAtZoom} = this
        const {stars, planets, fleets} = starSystem
        const objects = [...stars, ...planets, ...fleets];
        const hw = mapWidth/2
        const hh = mapHeight/2
        const cx = selectedObject ? selectedObject.x : 0
        const cy = selectedObject ? selectedObject.y : 0

        //draw orbits
        const orbits = []
        for (const obj of objects) {
            if (obj.orbit) orbits.push([obj, obj.orbit])
        }

        orbits.forEach( ([obj, orbit], index) => {
            const id = `orbit${index}`
            let gfx = this.leftPane.querySelector('#'+id)
            if (!gfx) return
            if (zoom > noOrbitsAtZoom) gfx.style.display = 'none'
            else {
                const size = Math.max(8, (orbit.radius || 0) * 2 * zoom);
                applyStyle(gfx, {
                    display: '',
                    left: ((obj.parent.x-cx) * zoom + hw) + 'px',
                    top: ((obj.parent.y-cy) * zoom + hh) + 'px',
                    width: (size) + 'px',
                    height: (size) + 'px',
                })
            }
        });
        
        //draw routes
        const routes = [gameState.fleet.route]
        routes.forEach( (route,index) =>{
            if (!route) return
            const id = `route${index}`
            let gfx = this.leftPane.querySelector('#'+id)
            if (!gfx) return
            if (zoom > noOrbitsAtZoom) gfx.style.display = 'none'
            else {
                let {startX, startY, distance} = route
                applyStyle(gfx, {
                    display: '',
                    width: `${distance * zoom}px`,
                    left: ((startX-cx) * zoom + hw) + 'px',
                    top: ((startY-cy) * zoom + hh) + 'px',
                })
            }
        })

        //draw objects
        objects.forEach( (obj, index) => {
            //if (obj.location) return //dont display docked fleets
            const id = `obj${index}`
            const wrapperId = `wrapper${index}`
            let gfx = this.leftPane.querySelector('#'+id)
            let wrapperGfx = this.leftPane.querySelector('#'+wrapperId)
            if (!gfx || !wrapperGfx) return
            const size = Math.max(8, (obj.graphics?.size || 0) * zoom / EARTH_RADII_PER_AU);
            applyStyle(gfx, {
                width: (size) + 'px',
                height: (size) + 'px',
            })
            applyStyle(wrapperGfx, {
                left: ((obj.x-cx) * zoom + hw) + 'px',
                top: ((obj.y-cy) * zoom + hh) + 'px',
            })
        })
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
        this.selectedObject = obj;
        this.refresh();
    }

    adjustZoom(factor) {
        this.zoom *= factor;
        this.zoom = Math.min(this.maxZoom, this.zoom)
        this.zoom = Math.max(this.minZoom, this.zoom)
        this.refreshLeftPane();
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

    togglePause(newPausedState) {
        this.paused = (newPausedState !== undefined ? newPausedState : !this.paused)
        if (!this.paused) this.tick()
        this.refresh() //always do first refresh, as fleets launch during pause/unpause
    }

    tick() {
        if (this.paused) return
        const playerWasDocked = (gameState.fleet.location !== undefined)

        gameState.year += this.yearsPerTick
        gameState.system.refreshPositions()

        this.refreshLeftPane()
        this.refreshInfoBar()

        //pause if player reached his destination
        let shouldPause = false
        if (!playerWasDocked && gameState.fleet.location) shouldPause = true

        if (shouldPause) this.togglePause(true)
        else setTimeout(()=>{this.tick(), this.msPerTick})
    }
}


function showStarMap(autoSelectObject = gameState.fleet) {
    const starMap = new StarMap(gameState.system, autoSelectObject)
    showElement(starMap.root)
}