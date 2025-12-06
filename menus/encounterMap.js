// Star Map using a class instead of a single function

class EncounterMap {
    constructor(encounter = new Encounter(), autoSelectObject = gameState.fleet) {
        this.encounter = encounter
        this.selectedObject = autoSelectObject || gameState.fleet;

        this.zoom = 100*1000*1000; //default zoom = 1 px = 1x 100 millionth of an au, or ~1 mile
        this.cameraX = this.selectedObject.x;
        this.cameraY = this.selectedObject.y;
        this.mapWidth = 1200
        this.mapHeight = 600
        this.minZoom = 1*1000*1000
        this.maxZoom = 5000*1000*1000*1000
        //this.noOrbitsAtZoom = 5000
        this.paused = true
        this.yearsPerTick = 1/60/24/365 //1 minute per tick
        this.thrusterPenalty = 1/1000 //ships are already going fast, cant move much due to inertia
        this.msPerTick = 250

        this.root = createElement({classNames: ['starmap-root']})
        this.infoBar = createElement({parent: this.root, classNames:['starmap-info']})
        this.controls = createElement({parent: this.root})
        this.main = createElement({parent: this.root, classNames:['starmap-main']})

        this.leftPane = createElement({parent:this.root, classNames:['starmap-left']})
        this.leftPane.style.width = this.mapWidth+'px';
        this.leftPane.style.height = this.mapHeight+'px';
        attachDragHandler(this.leftPane, (x,y)=>this.onDragMap(x,y), 5)
        attachMouseWheelHandler(this.leftPane, (direction=1)=>{
            this.adjustZoom(direction > 0 ? 1.33 : direction < 0 ? 0.66 : 1.0)
        })

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
                //ship info button?
                //createElement({tag:'button', innerHTML:'Trade Info', onClick: ()=> this.onTradeInfo()})
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

    rebuildLeftPane() {
        const {leftPane, encounter} = this
        const playerFleet = gameState.fleet
        const playerShips = playerFleet.ships
        const enemyFleet = encounter.fleet
        const enemyShips = enemyFleet.ships
        const ships = [...playerShips, ...enemyShips];

        leftPane.innerHTML = ""

        ships.forEach((ship,index)=>{
            const id = `shippath${index}`
            const color = ship.graphics?.color || '#ffffff'
            createElement({
                id,
                parent: leftPane,
                classNames: ['starmap-line'],
                style: {
                    backgroundColor: color,
                },
            })
        })

        //draw objects
        ships.forEach((ship,index) => {
            //if (obj.location) return //dont display docked fleets
            const id = `ship${index}`
            const wrapperId = `wrapper${index}`
            console.log('rebuilding a ship')
            const color = ship.graphics?.color || '#ffffff'
            createElement({
                id: wrapperId,
                parent: leftPane,
                classNames: ['starmap-object'],
                onClick: ()=>this.selectObject(ship),
                children: [
                    createElement({
                        id,
                        classNames: ['starmap-ship'],
                        style: {
                            color: color,
                        }
                    }),
                    createElement({classNames: ['starmap-label'], innerHTML: coloredName(ship)})
                ]
            })
        })
    }

    refreshLeftPane() {
        const {zoom, mapWidth, mapHeight, encounter, noOrbitsAtZoom} = this
        const playerFleet = gameState.fleet
        const playerShips = playerFleet.ships
        const enemyFleet = encounter.fleet
        const enemyShips = enemyFleet.ships
        const ships = [...playerShips, ...enemyShips];

        const hw = mapWidth/2
        const hh = mapHeight/2
        const cx = this.cameraX;
        const cy = this.cameraY;

        const shipPaths = ships.map(ship=>{
            if (ship.destinationX == undefined || ship.destinationY == undefined) return null
            return new ShipPath(ship, ship.destinationX, ship.destinationY)
        })

        //draw ship paths
        ships.forEach( (ship, index) => {
            const id = `shippath${index}`
            let gfx = this.leftPane.querySelector('#'+id)
            const shipPath = shipPaths[index]
            if (!shipPath) {
                gfx.style.display = 'none'
                return
            }
            let {startX, startY, distance, angleDeg} = shipPath
            applyStyle(gfx, {
                display: '',
                width: `${distance * zoom}px`,
                transform: `rotate(${angleDeg}deg)`,
                left: ((startX-cx) * zoom + hw) + 'px',
                top: ((startY-cy) * zoom + hh) + 'px',
            })
        })

        //draw objects
        ships.forEach( (ship, index) => {
            //if (obj.location) return //dont display docked fleets
            const id = `ship${index}`
            const wrapperId = `wrapper${index}`
            let gfx = this.leftPane.querySelector('#'+id)
            let wrapperGfx = this.leftPane.querySelector('#'+wrapperId)
            if (!gfx || !wrapperGfx) return
            const size = Math.max(8, (ship.graphics?.size || 0) * zoom / EARTH_RADII_PER_AU);
            const shipPath = shipPaths[index]
            const angleDeg = shipPath ? shipPath.angleDeg : 0
            applyStyle(gfx, {
                width: (size) + 'px',
                height: (size) + 'px',
                transform: `rotate(${angleDeg+135}deg)`
            })
            applyStyle(wrapperGfx, {
                left: ((ship.x-cx) * zoom + hw) + 'px',
                top: ((ship.y-cy) * zoom + hh) + 'px',
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
    }

    selectObject(obj) {
        this.selectedObject = obj;
        this.cameraX = obj.x;
        this.cameraY = obj.y;
        this.refresh();
    }

    onDragMap(x = 0, y = 0) {
        console.log('move map:',x,y)
        this.cameraX -= x/this.zoom
        this.cameraY -= y/this.zoom
        this.refreshLeftPane()
    }

    adjustZoom(factor) {
        this.zoom *= factor;
        this.zoom = Math.min(this.maxZoom, this.zoom)
        this.zoom = Math.max(this.minZoom, this.zoom)
        this.refreshLeftPane();
    }

    togglePause(newPausedState) {
        this.paused = (newPausedState !== undefined ? newPausedState : !this.paused)
        if (!this.paused) this.tick()
        this.refresh() //always do first refresh, as fleets launch during pause/unpause
    }

    tick() {
        if (this.paused) return

        gameState.year += this.yearsPerTick
        gameState.system.refreshPositions()

        this.refreshLeftPane()
        this.refreshInfoBar()
    }
}

function startEncounter() {
    const encounter = generateEncounter()
    gameState.encounter = encounter

    //randomize ship locations
    const playerFleet = gameState.fleet
    const playerShips = playerFleet.ships
    const enemyFleet = encounter.fleet
    const enemyShips = enemyFleet.ships
    const spawnDistance = ENCOUNTER_MAP_SIZE_AU*0.25

    for (const ship of playerShips) {
        const [x,y] = rotatePoint(-rng(spawnDistance, 0, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
        ship.x = x
        ship.y = y
    }
    for (const ship of enemyShips) {
        const [x,y] = rotatePoint(rng(spawnDistance, 0, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
        ship.x = x
        ship.y = y
        ship.graphics.color = 'orange'
    }

    showModal(encounter.encounterType.name, encounter.encounterType.description, [['Ok', ()=>{
        showEncounterMap()
        encounter.encounterType.onStart()
    }]])
}

function endEncounter() {
    gameState.encounter = undefined
    showStarMap()
}

function showEncounterMap() {
    const encounterMap = new EncounterMap(gameState.encounter, gameState.fleet.ships[0])
    showElement(encounterMap.root)
}

function startCombat() {
    gameState.encounter.combatEnabled = true;
    closeModal()
}

function endCombat(playerVictory = false) {
    gameState.encounter.combatEnabled = false;
    if (playerVictory) {
        //showVictoryMenu()
    }
    else gameState.encounter.encounterType.afterDefeated()
}