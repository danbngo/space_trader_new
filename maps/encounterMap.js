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

        this.paused = true
        this.lastTickMs = Date.now()
        this.gameSecondsPerMs = 1/1000

        /*this.root = createElement({classNames: ['starmap-root']})
        this.infoBar = createElement({parent: this.root, classNames:['starmap-info-bar']})
        this.controls = createElement({parent: this.root})
        this.main = createElement({parent: this.root, classNames:['starmap-main']})

        const baseZoom = 1200*50*1000/MILES_PER_AU
        this.cvs = new CanvasWrapper(1200, 600, 'black', baseZoom, baseZoom/10, baseZoom*10, encounter.mapDimensions)
        this.leftSection = createElement({parent:this.root, classNames:['starmap-left'], children:[this.cvs.root]})

        this.rightSection = createElement({parent:this.root, classNames:['starmap-right']})

        this.main.appendChild(this.leftSection);
        this.main.appendChild(this.rightSection);*/
        this.projectileGfxMap = new Map()

        const baseZoom = 1200*50*1000/MILES_PER_AU
        this.cvs = new CanvasWrapper(baseZoom, baseZoom/10, baseZoom*10, encounter.mapDimensions)
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
                createElement({tag:'button', innerHTML:this.paused ? '▶' : '⏸', onClick: () => this.togglePause(), disabled: !gameState.encounter.combatEnabled}),
                createElement({tag:'button', innerHTML:'+', onClick: () => this.cvs.adjustZoom(1.33)}),
                createElement({tag:'button', innerHTML:'-', onClick: () => this.cvs.adjustZoom(0.66)}),
                //ship info button?
                createElement({tag:'button', innerHTML: '🗨', onClick: ()=> this.onHail()})
            ]
        })
    }

    refreshInfoBar() {
        const {encounter} = gameState

        this.infoBar.innerHTML = ""
        createElement({
            parent:this.infoBar,
            classNames: ['starmap-info-bar'],
            children: [
                encounter.encounterType.name
            ]
        })
    }

    rebuildCanvas() {
        const {encounter, cvs, starSystem} = this
        const playerFleet = gameState.fleet
        const playerShips = playerFleet.ships
        const enemyFleet = encounter.fleet
        const enemyShips = enemyFleet.ships
        const ships = [...playerShips, ...enemyShips];
        const mod = 2000 //hacky way to position stars intended for starmap onto the encounter map

        cvs.clear()

        cvs.addEmptyCircle('maplimits', 0, 0, this.encounter.mapDimensions, 24, 'cyan')

        starSystem.backgroundStars.forEach( (bgStar, index) => {
            cvs.addPixel(`bgstar${index}`, bgStar.x * mod, bgStar.y * mod, bgStar.calcColor())
        });

        ships.forEach((ship,index) => {
            const shipObj = cvs.addTriangle(`ship${index}`, ship.x, ship.y, ship.radius, 12, ship.color, ship.angle, ()=>this.selectObject(ship))
            cvs.addEmptyCircle(`shipshield${index}`, ship.x, ship.y, ship.radius*1.1, 10, 'cyan')
            const labelObj = cvs.addText(`shiplabel${index}`, ship.x, ship.y, 0, -32, ship.name, ship.color, DEFAULT_FONT_SIZE)
            cvs.addTriangle(`shipthruster${index}`, ship.x, ship.y, ship.radius/EARTH_RADII_PER_AU*0.5, 6, 'orange', ship.angle - Math.PI)
            cvs.addTriangle(`shipbrakeleft${index}`, ship.x, ship.y, ship.radius/EARTH_RADII_PER_AU*0.5, 6, 'orange', ship.angle - Math.PI*1/2)
            cvs.addTriangle(`shipbrakeright${index}`, ship.x, ship.y, ship.radius/EARTH_RADII_PER_AU*0.5, 6, 'orange', ship.angle - Math.PI*3/2)
            const objs = [shipObj, labelObj]
            for (const obj of objs) {
                obj.onHover = ()=>{
                    for (const obj2 of objs) obj2.filters.set('brightness',1.5)
                }
                obj.onHoverEnd = ()=>{
                    for (const obj3 of objs) obj3.filters.delete('brightness')
                }
            }
        })

        cvs.recalculateDrawOrder()
    }

    refreshCanvas() {
        const {encounter, cvs} = this
        const playerFleet = gameState.fleet
        const playerShips = playerFleet.ships
        const enemyFleet = encounter.fleet
        const enemyShips = enemyFleet.ships
        const ships = [...playerShips, ...enemyShips];
        const {projectiles} = encounter

        const liveProjectileUuids = []

        projectiles.forEach( (proj)=> {
            const {uuid, color, radius} = proj
            liveProjectileUuids.push(uuid)
            const id = 'proj'+uuid
            let gfx = cvs.getObject(id)
            if (!gfx) {
                gfx = cvs.addFilledCircle(id, 0, 0, radius, 2, color)
                this.projectileGfxMap.set(uuid, gfx)
            }
            gfx.x = proj.x
            gfx.y = proj.y
        })

        //draw objects
        ships.forEach( (ship, index) => {
            const invisible = ship.escaped

            //if (obj.location) return //dont display docked fleets
            const cvsShipObject = cvs.getObject(`ship${index}`)
            const cvsShieldObject = cvs.getObject(`shipshield${index}`)
            const cvsLabelObject = cvs.getObject(`shiplabel${index}`)
            const cvsThrusterObject = cvs.getObject(`shipthruster${index}`)
            const cvsBrakeLeftObject = cvs.getObject(`shipbrakeleft${index}`)
            const cvsBrakeRightObject = cvs.getObject(`shipbrakeright${index}`)

            if (invisible) {
                cvsLabelObject.visible = false
                cvsShieldObject.visible = false
                cvsLabelObject.visible = false
                cvsThrusterObject.visible = false
                cvsBrakeLeftObject.visible = false
                cvsBrakeRightObject.visible = false
                return
            }

            const shieldsRatio = ship.shields[0]/ship.shields[1]
            const shield255 = Math.round(255*shieldsRatio)
            const hullRatio = 0.25 + (0.75*ship.hull[0]/ship.hull[1])

            cvsShipObject.x = ship.x
            cvsShipObject.y = ship.y
            cvsShipObject.rotation = ship.angle
            cvsShipObject.filters.set('opacity', hullRatio)
            
            cvsShieldObject.x = ship.x
            cvsShieldObject.y = ship.y
            cvsShieldObject.color =  `rgba(0,${shield255},${shield255})`

            cvsLabelObject.x = ship.x
            cvsLabelObject.y = ship.y

            //animate thrusters
            if (!ship.accelerating) cvsThrusterObject.visible = false
            else {
                const [screenOffsetX, screenOffsetY] = rotatePoint(4, 0, 0, 0, ship.angle-Math.PI)
                const [oX, oY] = rotatePoint(ship.radius, 0, 0, 0, ship.angle-Math.PI)
                cvsThrusterObject.visible = true
                cvsThrusterObject.x = ship.x + oX
                cvsThrusterObject.y = ship.y + oY
                cvsThrusterObject.screenOffsetX = screenOffsetX
                cvsThrusterObject.screenOffsetY = screenOffsetY
            }

            //TODO: brake triangles seem pointed in the wrong directions
            if (!ship.braking && !ship.turningLeft) cvsBrakeLeftObject.visible = false
            else {
                const [screenOffsetX, screenOffsetY] = rotatePoint(4, 0, 0, 0, ship.angle-Math.PI/2)
                const [oX, oY] = rotatePoint(ship.radius, 0, 0, 0, ship.angle-Math.PI/2)
                cvsBrakeLeftObject.visible = true
                cvsBrakeLeftObject.x = ship.x + oX
                cvsBrakeLeftObject.y = ship.y + oY
                cvsBrakeLeftObject.screenOffsetX = screenOffsetX
                cvsBrakeLeftObject.screenOffsetY = screenOffsetY
            }
            if (!ship.braking && !ship.turningRight) cvsBrakeRightObject.visible = false
            else {
                const [screenOffsetX, screenOffsetY] = rotatePoint(4, 0, 0, 0, ship.angle-Math.PI*3/2)
                const [oX, oY] = rotatePoint(ship.radius, 0, 0, 0, ship.angle-Math.PI*3/2)
                cvsBrakeRightObject.visible = true
                cvsBrakeRightObject.x = ship.x + oX
                cvsBrakeRightObject.y = ship.y + oY
                cvsBrakeRightObject.screenOffsetX = screenOffsetX
                cvsBrakeRightObject.screenOffsetY = screenOffsetY
            }
        })

        //clean up unused projectile gfx
        const deadProjectileUuids = this.projectileGfxMap.keys().filter(k=>(!liveProjectileUuids.includes(k)))
        for (const uuid of deadProjectileUuids) {
            const id = 'proj'+uuid
            cvs.deleteObject(id)
            this.projectileGfxMap.delete(uuid)
        }

        cvs.redraw()
    }

    refreshObjectPane() {
        //const playerShips = gameState.fleet.ships
        const obj = this.selectedObject
        this.objectPane.innerHTML = '';
        if (!this.selectedObject) {
            return;
        }
        createElement({
            parent:this.objectPane, tag:'h2', innerHTML: coloredName(obj), classNames: ['clickable-text'],
            onClick: ()=>this.selectObject(obj)
        })
        if (obj instanceof Ship) {
            const {hull, shields} = obj
            createElement({parent:this.objectPane, innerHTML: `Hull: ${statColorSpan(round(100 * hull[0]/hull[1]), hull[0]/hull[1], true)}%`})
            createElement({parent:this.objectPane, innerHTML: `Shields: ${statColorSpan(round(100 * obj.shields[0]/obj.shields[1]), shields[0]/shields[1], true)}%`})
            createElement({parent:this.objectPane, innerHTML: obj.isDisabled() ? `(Disabled)` : obj.escaped ? '(Escaped)' : ''})
        }
    }

    selectObject(obj) {
        console.log('selected:',obj)
        this.selectedObject = obj;
        this.cvs.moveCameraTo(obj.x, obj.y)
        this.refresh();
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

        this.refreshCanvas()
        this.refreshObjectPane();

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

    //ships never have backward momentum
    for (const ship of [...enemyShips, ...playerShips]) {
        ship.resetCombatVars()
        const [speedX, speedY] = rotatePoint(rng(spawnDistance/10, spawnDistance/10, false), 0, 0, 0, rng(0, Math.PI*4, false))
        Object.assign(ship, {speedX,speedY})
    }


    for (const ship of playerShips) {
        const [x,y] = rotatePoint(-rng(spawnDistance, spawnDistance/2, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
        const [speedX, speedY] = rotatePoint(rng(spawnDistance/10, spawnDistance/20, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
        const randomTarget = rndMember(enemyShips)
        Object.assign(ship, {x, y, speedX, speedY, angle: new Path(ship.x, ship.y, randomTarget.x, randomTarget.y).angle})
        //make first player ship controllable. TODO: make this more configurable later
        if (ship == playerShips[0]) {
            ship.autoCombat = false;
            ship.manualCombat = true;
        }
    }
    for (const ship of enemyShips) {
        const [x,y] = rotatePoint(rng(spawnDistance, spawnDistance/2, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
        const [speedX, speedY] = rotatePoint(-rng(spawnDistance/10, spawnDistance/20, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
        const randomTarget = rndMember(playerShips)
        const angle = new Path(ship.x, ship.y, randomTarget.x, randomTarget.y).angle
        Object.assign(ship, {x, y, speedX, speedY, color: '#d33', angle})
    }

    showModal(encounter.encounterType.name, encounter.encounterType.description, [['Ok', ()=>{
        showEncounterMap()
        encounter.encounterType.onStart()
    }]])
}

function endEncounter() {
    gameState.encounter = undefined
    showStarMap()
    //restore all shields
    for (const s of gameState.fleet.ships) s.restoreShields()
    //pause and show modal if player has no working ships, cant move
    if (gameState.fleet.isStranded()) {
        handlePlayerStranded()
        return
    }
}

function handlePlayerStranded() {
    const [nearestPlanet, nearestDistance] = gameState.system.calcNearestPlanet(gameState.fleet)
    const creditCost = rng(20*nearestDistance, 10*nearestDistance)
    const dayCost = rng(1.5*nearestDistance, 0.75*nearestDistance, false)
    console.log('player is stranded:',nearestPlanet,nearestDistance,creditCost,dayCost)
    gameState.fleet.dock(nearestPlanet)

    let msg = `You have no working ships remaining, so you have to call a tow ship.<br/>`
    msg += `It tows your ships to the nearest planet for ${creditCost}CR.<br/>`
    msg += `You also lose ${round(dayCost,1)} days while waiting.<br/>`

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