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
        this.yearsPerTick = 1/365/24 //1 hour per tick
        this.msPerTick = 200

        this.root = createElement({classNames: ['starmap-root']})
        this.infoBar = createElement({parent: this.root, classNames:['starmap-info']})
        this.controls = createElement({
            parent: this.root,
            classNames: ['starmap-buttons'],
            children: [
                createElement({tag:'button', innerHTML:this.paused ? '▶' : '⏸', onClick: () => this.togglePause()}),
                createElement({tag:'button', innerHTML:'+', onClick: () => this.adjustZoom(1.33)}),
                createElement({tag:'button', innerHTML:'-', onClick: () => this.adjustZoom(0.66)}),
                createElement({tag:'button', innerHTML:'Explore', onClick: ()=> this.onExplore()}),
                createElement({tag:'button', innerHTML:'Trade Info', onClick: ()=> this.onTradeInfo()})
            ]
        })
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
        this.refreshInfoBar();
        this.refreshLeftPane();
        this.refreshRightPane();
    }

    refreshInfoBar() {
        const {fleet, year} = gameState
        const {location, route} = fleet
        const destination = route?.destination
        const distance = round(route?.distance, 2)
        const endYear = route?.endYear
        const yearsRemaining = describeTime(endYear-year)

        this.infoBar.innerHTML = ''
        createElement({
            parent:this.infoBar,
            style: {
                display: 'flex',
                gap: '8px'
            },
            children: [
                createElement({innerHTML: `Year: ${year}`}),
                createElement({innerHTML: ` | Location: ${location ? coloredName(location, false) : '(Space)'}`, onClick: ()=>this.selectObject(location)}),
                createElement({innerHTML: ` | Destination: ${destination ? coloredName(destination, false) : '(None)'}`, onClick: destination ? ()=>this.selectObject(destination) : undefined}),
                createElement({innerHTML: !destination ? '' : ` | Distance: ${distance}`}),
                createElement({innerHTML: !destination ? '' : ` | ETA: ${yearsRemaining}`}),
            ]
        })
    }

    refreshLeftPane() {
        const {zoom, mapWidth, mapHeight, selectedObject, starSystem, leftPane, noOrbitsAtZoom} = this
        leftPane.innerHTML = '';
        const {stars, planets, fleets} = starSystem
        const objects = [...stars, ...planets, ...fleets];
        const hw = mapWidth/2
        const hh = mapHeight/2
        const cx = selectedObject ? selectedObject.x : 0
        const cy = selectedObject ? selectedObject.y : 0

        //draw orbits
        if (zoom < noOrbitsAtZoom) {
            const orbits = []
            for (const obj of objects) {
                if (obj.orbit) orbits.push([obj, obj.orbit])
            }

            orbits.forEach( ([obj, orbit]) => {
                const size = Math.max(5, (orbit.radius || 0) * 2 * zoom);
                const color = obj.graphics?.color || '#ffffff'
                createElement({
                    parent: leftPane,
                    classNames: ['starmap-orbit'],
                    style: {
                        left: ((obj.parent.x-cx) * zoom + hw) + 'px',
                        top: ((obj.parent.y-cy) * zoom + hh) + 'px',
                        width: (size) + 'px',
                        height: (size) + 'px',
                        borderColor: color
                    },
                })
            });
        }
        
        //draw routes
        const routes = [gameState.fleet.route]
        routes.forEach(route=>{
            if (!route) return
            const color = route.fleet.graphics?.color || '#ffffff'
            let {startX, startY, distance, angleDeg} = route
            createElement({
                parent: leftPane,
                classNames: ['starmap-line'],
                style: {
                    width: `${distance * zoom}px`,
                    left: ((startX-cx) * zoom + hw) + 'px',
                    top: ((startY-cy) * zoom + hh) + 'px',
                    backgroundColor: color,
                    transform: `rotate(${angleDeg}deg)`
                },
            })
        })

        //draw objects
        objects.forEach(obj => {
            //if (obj.location) return //dont display docked fleets
            const objIsFleet = obj instanceof Fleet
            const size = Math.max(5, (obj.graphics?.size || 0) * zoom / EARTH_RADII_PER_AU);
            const color = obj.graphics?.color || '#ffffff'

            let icon;
            let style = {
                width: (size) + 'px',
                height: (size) + 'px',
                color: color,
            }
            if (objIsFleet) {
                const angleDeg = (obj.route ? obj.route.angleDeg : 0)+45
                icon = createElement({
                    classNames: ['starmap-ship'],
                    style: {
                        ...style,
                        transform: `rotate(${angleDeg}deg)`
                    }
                })
            }
            else {
                icon = createElement({classNames: ['starmap-circle'], style: {...style, background: color}})
            }
            
            const wrapper = createElement({
                parent: leftPane,
                classNames: ['starmap-object'],
                style: {
                    left: ((obj.x-cx) * zoom + hw) + 'px',
                    top: ((obj.y-cy) * zoom + hh) + 'px',
                },
                onClick: ()=>this.selectObject(obj),
                children: [icon]
            })
            if (!(obj instanceof Fleet) || obj.location == undefined) {
                createElement({parent: wrapper, classNames: ['starmap-label'], innerHTML: coloredName(obj)})
            }
        });
    }

    refreshRightPane() {
        this.rightPane.innerHTML = '';
        if (!this.selectedObject) {
            this.rightPane.textContent = '(Select an object on the map.)';
            return;
        }
        createElement({parent:this.rightPane, tag:'h2', innerHTML: coloredName(this.selectedObject)})
        // Planet-specific actions
        if (this.selectedObject instanceof Planet) {
            createElement({parent:this.rightPane, tag:'button', innerHTML:'Scan', onClick:()=>this.scanPlanet(this.selectedObject)})
            createElement({parent:this.rightPane, tag:'button', innerHTML:'Set Destination', onClick:()=>this.setDestination(this.selectedObject), disabled: (this.selectedObject == gameState.fleet.location)})
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

    onExplore() {
        if (gameState.fleet.location) showPlanetMenu(gameState.fleet.location)
    }

    onTradeInfo() {
        showTradeInfoSellMenu()
    }

    scanPlanet(obj = new SpaceObject()) {
        if (obj instanceof Planet) showPlanetMenu(obj)
    }

    setDestination(obj = new SpaceObject()) {
        if (obj instanceof Planet) gameState.fleet.route = new Route(gameState.fleet, obj)
        this.refresh()
    }

    togglePause() {
        this.paused = !this.paused
        if (!this.paused) this.tick()
    }

    tick() {
        if (this.paused) return
        gameState.year += this.yearsPerTick
        gameState.system.refreshPositions()
        this.refresh()
        setTimeout(()=>{this.tick(), this.msPerTick})
    }
}


function showStarMap(autoSelectObject = gameState.fleet) {
    const starMap = new StarMap(gameState.system, autoSelectObject)
    showElement(starMap.root)
}