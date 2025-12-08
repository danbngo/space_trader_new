/*
EncounterMap
tick speed: 1 second per real life second (*60*60 speed compared to the starmap)
default zoom distances: 1200px = 1000 miles
combat map size = 5000 miles
*/
class EncounterMap {
    constructor(encounter = new Encounter(), autoSelectObject = gameState.fleet) {
        this.starSystem = gameState.system
        this.encounter = encounter
        this.selectedObject = autoSelectObject || gameState.fleet;

        this.zoom = 1200*10*1000/MILES_PER_AU;
        this.maxZoom = this.zoom*10
        this.minZoom = this.zoom/10
        this.cameraPanLimit = encounter.mapDimensions

        this.cameraX = this.selectedObject.x;
        this.cameraY = this.selectedObject.y;
        this.mapWidth = 1200
        this.mapHeight = 600
        //this.noOrbitsAtZoom = 5000
        this.paused = true
        this.lastTickMs = Date.now()
        this.gameSecondsPerMs = 1/1000

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

        this.leftPaneBGLayer = createElement({parent:this.leftPane, classNames:['starmap-layer']})
        this.leftPaneBGLayerCvs = createElement({parent:this.leftPaneBGLayer, tag:'canvas'})
        this.leftPaneBGLayerCvs.height = this.mapHeight;
        this.leftPaneBGLayerCvs.width = this.mapWidth;
        this.leftPaneObjLayer = createElement({parent:this.leftPane, classNames:['starmap-layer']})

        this.rightPane = createElement({parent:this.root, classNames:['starmap-right']})

        this.main.appendChild(this.leftPane);
        this.main.appendChild(this.rightPane);

        this.projectileGfxMap = new Map()

        this.refresh()
    }

    refresh() {
        this.rebuildLeftPaneObjLayer();
        this.refreshControls();
        this.refreshInfoBar();
        this.refreshRightPane();
        this.refreshLeftPaneObjLayer();
        this.refreshLeftPaneBGLayer();
    }

    refreshControls() {
        this.controls.innerHTML = ""
        createElement({
            parent:this.controls,
            classNames: ['starmap-buttons'],
            children: [
                createElement({tag:'button', innerHTML:this.paused ? '▶' : '⏸', onClick: () => this.togglePause(), disabled: !gameState.encounter.combatEnabled}),
                createElement({tag:'button', innerHTML:'+', onClick: () => this.adjustZoom(1.33)}),
                createElement({tag:'button', innerHTML:'-', onClick: () => this.adjustZoom(0.66)}),
                //ship info button?
                createElement({tag:'button', innerHTML: !gameState.encounter.combatEnabled ? 'Hail' : 'Surrender', onClick: ()=> this.onHail()})
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
        const {leftPaneObjLayer, encounter} = this
        const playerFleet = gameState.fleet
        const playerShips = playerFleet.ships
        const enemyFleet = encounter.fleet
        const enemyShips = enemyFleet.ships
        const ships = [...playerShips, ...enemyShips];

        leftPaneObjLayer.innerHTML = ""

        //we can't do projectiles here since they phase in and out of existence

        //draw objects
        ships.forEach((ship,index) => {
            //if (obj.location) return //dont display docked fleets
            const id = `ship${index}`
            const shieldId = `shipshield${index}`
            const wrapperId = `wrapper${index}`
            console.log('rebuilding a ship')
            const color = ship.graphics?.color || '#ffffff'
            createElement({
                id: wrapperId,
                parent: leftPaneObjLayer,
                classNames: ['starmap-object'],
                onClick: ()=>this.selectObject(ship),
                children: [
                    createElement({
                        id: shieldId,
                        classNames: ['starmap-circle-empty'],
                    }),
                    createElement({
                        id,
                        classNames: ['starmap-triangle'],
                        style: {
                            backgroundColor: color,
                            zIndex: '99',
                        }
                    }),
                    createElement({classNames: ['starmap-label'], innerHTML: coloredName(ship)})
                ]
            })
        })
    }

    refreshLeftPaneBGLayer() {
        const {zoom, mapWidth, mapHeight, starSystem, encounter} = this
        const hw = mapWidth/2
        const hh = mapHeight/2
        const cx = this.cameraX;
        const cy = this.cameraY;
        const objs = [...starSystem.backgroundStars]
        const canvas = this.leftPaneBGLayerCvs;
        const ctx = this.leftPaneBGLayerCvs.getContext("2d");
        const mod = 2000 //hacky way to position stars intended for starmap onto the encounter map

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        objs.forEach((obj, index)=>{
            ctx.fillStyle = obj.graphics.color;
            ctx.beginPath();
            ctx.arc((mod*obj.x-cx)*zoom+hw, (mod*obj.y-cy)*zoom+hh, 1, 0, Math.PI * 2);
            ctx.fill();
        })

        //draw map edge
        ctx.beginPath();
        //ctx.arc(hw, hh, mapDimensions*zoom, 0, Math.PI * 2);
        ctx.arc(hw-cx*zoom, hh-cy*zoom, encounter.mapDimensions*zoom, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    refreshLeftPaneObjLayer() {
        const {zoom, mapWidth, mapHeight, encounter, leftPaneObjLayer} = this
        const playerFleet = gameState.fleet
        const playerShips = playerFleet.ships
        const enemyFleet = encounter.fleet
        const enemyShips = enemyFleet.ships
        const ships = [...playerShips, ...enemyShips];
        const {projectiles} = encounter

        const hw = mapWidth/2
        const hh = mapHeight/2
        const cx = this.cameraX;
        const cy = this.cameraY;

        /*const shipPaths = ships.map(ship=>{
            if (ship.destinationX == undefined || ship.destinationY == undefined) return null
            return new Path(ship.x, ship.y, ship.destinationX, ship.destinationY)
        })*/

        const liveProjectileUuids = []

        projectiles.forEach( (proj)=> {
            const {uuid, graphics} = proj
            liveProjectileUuids.push(uuid)
            const id = 'proj'+uuid
            const {color} = graphics
            let gfx = leftPaneObjLayer.querySelector('#'+id)
            if (!gfx) {
                gfx = createElement({
                    id,
                    parent: leftPaneObjLayer,
                    classNames: ['starmap-circle'],
                    style: {
                        backgroundColor: color,
                        zIndex: '99',
                    }
                })
                this.projectileGfxMap.set(uuid, gfx)
            }
            const size = Math.max(4, (graphics?.size || 0) * zoom);
            applyStyle(gfx, {
                width: (size) + 'px',
                height: (size) + 'px',
                left: ((proj.x-cx) * zoom + hw) + 'px',
                top: ((proj.y-cy) * zoom + hh) + 'px',
            })
        })

        //draw objects
        ships.forEach( (ship, index) => {
            //if (obj.location) return //dont display docked fleets
            const id = `ship${index}`
            const shieldId = `shipshield${index}`
            const wrapperId = `wrapper${index}`
            let gfx = leftPaneObjLayer.querySelector('#'+id)
            if (!gfx) return
            let shieldGfx = leftPaneObjLayer.querySelector('#'+shieldId)
            let wrapperGfx = leftPaneObjLayer.querySelector('#'+wrapperId)
            if (!gfx || !wrapperGfx) return
            const size = Math.max(12, (ship.graphics?.size || 0) * zoom);
            const shieldsRatio = ship.shields[0]/ship.shields[1]
            const shield255 = Math.round(255*shieldsRatio)
            const hullRatio = 0.25 + (0.75*ship.hull[0]/ship.hull[1])
            const invisible = ship.escaped

            if (invisible) {
                applyStyle(wrapperGfx, {
                    display: 'none'
                })
                return
            }

            applyStyle(shieldGfx, {
                width: (size+4) + 'px',
                height: (size+4) + 'px',
                borderColor: `rgba(0,${shield255},${shield255})`
            })
            applyStyle(gfx, {
                width: (size) + 'px',
                height: (size) + 'px',
                filter: `brightness(${hullRatio})`,
                transform: `translate(-50%, -50%) rotate(${ship.calcAngleDeg()}deg)`,
            })
            applyStyle(wrapperGfx, {
                display: '',
                left: ((ship.x-cx) * zoom + hw) + 'px',
                top: ((ship.y-cy) * zoom + hh) + 'px',
            })
        })

        //clean up unused projectile gfx
        const deadProjectileUuids = this.projectileGfxMap.keys().filter(k=>(!liveProjectileUuids.includes(k)))
        for (const uuid of deadProjectileUuids) {
            const id = 'proj'+uuid
            let gfx = leftPaneObjLayer.querySelector('#'+id)
            if (gfx) gfx.remove()
            this.projectileGfxMap.delete(uuid)
        }
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
        console.log('selected:',obj)
        this.selectedObject = obj;
        this.cameraX = obj.x;
        this.cameraY = obj.y;
        this.refresh();
    }

    onDragMap(x = 0, y = 0) {
        this.cameraX -= x/this.zoom
        this.cameraY -= y/this.zoom
        this.cameraX = Math.min(this.cameraPanLimit, Math.max(-this.cameraPanLimit, this.cameraX))
        this.cameraY = Math.min(this.cameraPanLimit, Math.max(-this.cameraPanLimit, this.cameraY))
        this.refreshLeftPaneBGLayer()
        this.refreshLeftPaneObjLayer()
    }

    adjustZoom(factor) {
        this.zoom *= factor;
        this.zoom = Math.min(this.maxZoom, this.zoom)
        this.zoom = Math.max(this.minZoom, this.zoom)
        this.refreshLeftPaneBGLayer()
        this.refreshLeftPaneObjLayer();
    }

    togglePause(newPausedState) {
        this.paused = (newPausedState !== undefined ? newPausedState : !this.paused)
        if (!this.paused) {
            this.lastTickMs = Date.now()
            this.tick()
        }
        this.refresh() //always do first refresh, as fleets launch during pause/unpause
    }

    tick() {
        if (this.paused || gameState.encounter.result || !gameState.encounter.combatEnabled) return

        const currentTime = Date.now()
        const elapsedMs = currentTime - this.lastTickMs
        this.lastTickMs = currentTime
        const elapsedSeconds = elapsedMs * this.gameSecondsPerMs;
        gameState.encounter.tick(elapsedSeconds)

        if (gameState.encounter.result) {
            endCombat()
            return
        }

        this.refreshLeftPaneObjLayer()
        this.refreshInfoBar()

        requestAnimationFrame(()=>this.tick())
    }

    onHail() {
        if (gameState.encounter.combatEnabled) {
            this.togglePause(true)
            showModal(`Surrender?`, `Surrender to the ${gameState.encounter.encounterType.name}?`, [
                ['Surrender', ()=>gameState.encounter.encounterType.onSurrender()],
                ['Cancel', ()=>closeModal()]
            ])
        }
        else gameState.encounter.encounterType.onStart()
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
    const spawnDistance = encounter.mapDimensions*ENCOUNTER_SHIP_MAX_SPAWN_DISTANCE_RATIO

    for (const ship of playerShips) {
        const [x,y] = rotatePoint(-rng(spawnDistance, 0, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
        ship.resetCombatVars()
        ship.x = x
        ship.y = y
        const randomTarget = rndMember(enemyShips)
        ship.angle = new Path(ship.x, ship.y, randomTarget.x, randomTarget.y).angle
        //make first player ship controllable. TODO: make this more configurable later
        if (ship == playerShips[0]) {
            ship.autoCombat = false;
            ship.manualCombat = true;
        }
    }
    for (const ship of enemyShips) {
        const [x,y] = rotatePoint(rng(spawnDistance, 0, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
        ship.resetCombatVars()
        ship.x = x
        ship.y = y
        ship.graphics.color = 'orange'
        const randomTarget = rndMember(playerShips)
        ship.angle = new Path(ship.x, ship.y, randomTarget.x, randomTarget.y).angle
    }

    showModal(encounter.encounterType.name, encounter.encounterType.description, [['Ok', ()=>{
        showEncounterMap()
        encounter.encounterType.onStart()
    }]])
}

function endEncounter() {
    gameState.encounter = undefined
    showStarMap()
    //pause and show modal if player has no working ships, cant move
    if (gameState.fleet.isStranded()) {
        handlePlayerStranded()
        return
    }
}

function handlePlayerStranded() {
    const [nearestPlanet, nearestDistance] = gameState.system.calcNearestPlanet(gameState.fleet)
    const creditCost = rng(20*nearestDistance, 10*nearestDistance)
    const dayCost = rng(1.5*nearestDistance, 0.75*nearestDistance)
    console.log('player is stranded:',nearestPlanet,nearestDistance,creditCost,dayCost)
    gameState.fleet.dock(nearestPlanet)

    let msg = `You have no working ships remaining, so you have to call a tow ship.<br/>`
    msg += `It tows your ships to the nearest planet for ${creditCost}CR.<br/>`
    msg += `You also lose ${dayCost} days while waiting.<br/>`

    showModal(`Stranded`, msg, [['Continue', ()=>showPlanetMenu(nearestPlanet)]])
}

function showEncounterMap() {
    const encounterMap = new EncounterMap(gameState.encounter, gameState.fleet.ships[0])
    showMap(encounterMap)
}

function startCombat() {
    gameState.encounter.combatEnabled = true;
    closeModal()
    currentMap.togglePause(false)
}

function endCombat() {
    const {encounter} = gameState
    const {result} = encounter
    if (result == ENCOUNTER_RESULTS.Defeat) {
        showModal(`Defeat`, `All your ships have been disabled!`, [['Continue', ()=>encounter.encounterType.onDefeat()]])
    }
    else if (result == ENCOUNTER_RESULTS.Victory) {
        showModal(`Victory`, `All enemy ships have been disabled! You win!`, [['Continue', ()=>encounter.encounterType.onVictory()]])
    }
    else if (result == ENCOUNTER_RESULTS.Escaped) {
        showModal(`Escape`, `You fled from the battlefield!`, [['Continue', ()=>encounter.encounterType.onEscape()]])
    }
    //else if (result == ENCOUNTER_RESULTS.Surrendered) encounter.encounterType.onSurrender() //handled elsewhere
}