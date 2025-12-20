class EncounterMap {
    constructor(encounter = new Encounter(), autoSelectObject = gs.fleet) {
        this.starSystem = gs.system
        this.encounter = encounter
        this.selectedObject = autoSelectObject || gs.fleet;

        this.paused = true
        this.lastTickMs = Date.now()
        this.maxMsPerTick = 100

        const baseZoom = ENCOUNTER_MAP_RADIUS_MILES / 10
        this.cvs = new CanvasWrapper(baseZoom, baseZoom/10, baseZoom*10, encounter.mapDimensions)
        this.root = ce({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.controls = ce({parent: this.root, style: {position: 'absolute', top: 0, left: 0}})
        this.infoBar = ce({parent: this.root, style:{position:'absolute', bottom: 0, left: 0}})
        this.objectPane = ce({parent: this.root, style: {position: 'absolute', top: 0, right: 0, height: '100%', pointerEvents: 'none'}})

        this.uiMode = UI_MODE.Default;
        this.targetingAreas = [];
        this.validTargets = [];

        this.rebuildCanvas();
        this.refresh()

        window.addEventListener("resize", ()=>this.cvs.autoResize());
        
        requestAnimationFrame(()=> requestAnimationFrame(()=>{
            this.cvs.autoResize();
            this.refresh();
        }));

    }

    refresh() {
        this.refreshControls();
        this.refreshInfoBar();
        this.refreshObjectPane();
        this.refreshCanvas(true);
    }

    refreshControls() {
        this.controls.innerHTML = ""
        ce({
            parent:this.controls,
            classNames: ['starmap-buttons'],
            children: [
                ce({tag:'button', innerHTML:this.paused ? '▶' : '⏸', onClick: () => this.togglePause(), disabled: !gs.encounter.combatEnabled}),
                ce({tag:'button', innerHTML:'+', onClick: () => this.cvs.adjustZoom(1.33)}),
                ce({tag:'button', innerHTML:'-', onClick: () => this.cvs.adjustZoom(0.66)}),
                //ship info button?
                ce({tag:'button', innerHTML: '🗨', onClick: ()=> this.onHail()})
            ]
        })
    }

    refreshInfoBar() {
        const {encounter} = gs

        this.infoBar.innerHTML = ""
        ce({
            parent:this.infoBar,
            classNames: ['starmap-info-bar'],
            children: [
                encounter.encounterType.name
            ]
        })
    }

    rebuildCanvas() {
        const {encounter, cvs, starSystem} = this
        const {ships} = encounter
        const BG_STAR_DISTANCE_MOD = 1 //hacky way to position stars intended for starmap onto the encounter map

        cvs.clear()

        cvs.addEmptyCircle('maplimits', 0, 0, this.encounter.mapDimensions, 24, COLORS.Cyan)

        starSystem.backgroundStars.forEach( (bgStar, index) => {
            cvs.addPixel(bgStar.x*BG_STAR_DISTANCE_MOD, bgStar.y*BG_STAR_DISTANCE_MOD, bgStar.r, bgStar.g, bgStar.b, bgStar.a, bgStar.size)
        });

        ships.forEach((ship,index) => {
            const shipObj = cvs.addTriangle(`ship${index}`, ship.x, ship.y, ship.radius, 12, ship.color, ship.angle, ()=>this.selectObject(ship), true)
            if (ship == this.selectedObject) shipObj.strokeColor = COLORS.Green
            cvs.addEmptyCircle(`shipshield${index}`, ship.x, ship.y, ship.radius*1.1, 10, COLORS.Blue, 1)
            const labelObj = cvs.addText(`shiplabel${index}`, ship.x, ship.y, 0, -32, ship.shipType.name, ship.color, DEFAULT_FONT_SIZE, 2, ()=>this.selectObject(ship))
            cvs.addTriangle(`shipthruster${index}`, ship.x, ship.y, ship.radius*0.5, 6, COLORS.Orange)
            const objs = [shipObj, labelObj]
            for (const obj of objs) {
                obj.onHover = ()=>{
                    for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                }
                obj.onHoverEnd = ()=>{
                    for (const obj3 of objs) obj3.strokeColor = this.calcStrokeColorForShip(ship)
                }
                obj.onHoverEnd()
            }
        })

        cvs.recalculateDrawOrder()
    }

    refreshCanvas(forceRedraw = false) {
        const {encounter, cvs} = this
        const {ships, activeTurnFleet} = encounter

        //draw objects
        ships.forEach( (ship, index) => {
            const invisible = ship.escaped

            //if (obj.location) return //dont display docked fleets
            const cvsShipObject = cvs.getObject(`ship${index}`)
            const cvsShieldObject = cvs.getObject(`shipshield${index}`)
            const cvsLabelObject = cvs.getObject(`shiplabel${index}`)
            const cvsThrusterObject = cvs.getObject(`shipthruster${index}`)

            if (invisible) {
                cvsShipObject.visible = false
                cvsShieldObject.visible = false
                cvsLabelObject.visible = false
                cvsThrusterObject.visible = false
                return
            }

            const shieldsRatio = ship.shields[0] <= 0 ? 0 : 0.25+(0.75*ship.shields[0]/ship.shields[1])
            const hullRatio = 0.25 + (0.75*ship.hull[0]/ship.hull[1])
            //const hull255 = Math.round(255*hullRatio)
            //const shields255 = Math.round(255*shieldsRatio)

            cvsShipObject.x = ship.x
            cvsShipObject.y = ship.y
            cvsShipObject.rotation = ship.angle
            cvsShipObject.fillColor[3] = hullRatio
            
            cvsShieldObject.x = ship.x
            cvsShieldObject.y = ship.y
            cvsShieldObject.strokeColor[3] = shieldsRatio
            cvsShieldObject.fillColor[3] = shieldsRatio

            cvsLabelObject.x = ship.x
            cvsLabelObject.y = ship.y

            let label = ship.shipType.name
            if (ship.isDisabled()) label += '☠'
            else if (ship.fleet != activeTurnFleet) label += ''
            else if (ship.numActionsRemaining == 0) label += '⧖'
            else if (ship.numActionsRemaining == 1) label += '¹'
            else if (ship.numActionsRemaining >= 2) label += '²'
            cvsLabelObject.textContent = label

            //animate thrusters
            if (!ship.accelerating) cvsThrusterObject.visible = false
            else {
                const [oX, oY] = rotatePoint(ship.radius*1.25, 0, 0, 0, ship.angle-Math.PI)
                cvsThrusterObject.visible = true
                cvsThrusterObject.x = ship.x + oX
                cvsThrusterObject.y = ship.y + oY
                cvsThrusterObject.rotation = ship.angle - Math.PI
            }
        })

        cvs.redraw(forceRedraw)
    }

    refreshAnimations(year = 0) {
        const {starSystem, cvs} = this
        const {backgroundStars} = starSystem
        backgroundStars.forEach( (bgStar, index) => {
            bgStar.twinkle(year)
            cvs.pixels[index].a = bgStar.a
        });
    }

    refreshObjectPane() {
        //const playerShips = gs.fleet.ships
        const {selectedObject, encounter} = this
        const {playerFleet, combatEnabled} = encounter

        const obj = selectedObject
        this.objectPane.innerHTML = '';

        const container = ce({parent:this.objectPane, classNames:['starmap-object-panel']})

        if (this.uiMode == UI_MODE.TargetingAttack) {
            ce({parent:container, innerHTML: `${obj.shipType.name}: Attack`})
            ce({parent:container, innerHTML: '(Select target)'})
            ce({parent:container, tag:'button', innerHTML:'Cancel', onClick: ()=>{
                this.stopTargeting()
            }})
            return;
        }

        if (this.uiMode == UI_MODE.TargetingMove) {
            ce({parent:container, innerHTML: `${obj.shipType.name}: Move`})
            ce({parent:container, innerHTML: '(Select destination)'})
            ce({parent:container, tag:'button', innerHTML:'Cancel', onClick: ()=>{
                this.stopTargeting()
            }})
            return;
        }

        if (!this.selectedObject) {
            return;
        }
        ce({
            parent:container, tag:'h3', innerHTML: coloredName(obj), classNames: ['clickable-text'],
            style: {filter: `drop-shadow(1px 0 0 ${colorArrToRgbaString(COLORS.Green)}) drop-shadow(0 1px 0 ${colorArrToRgbaString(COLORS.Green)})  drop-shadow(0 -0.5px 0 ${colorArrToRgbaString(COLORS.Green)})  drop-shadow(-0.5px 0 0 ${colorArrToRgbaString(COLORS.Green)})`},
            onClick: ()=>this.selectObject(obj)
        })
        if (obj instanceof Ship) {
            const index = this.encounter.ships.indexOf(obj)
            const {hull, shields} = obj
            const showActions = combatEnabled && obj.fleet == playerFleet && !obj.escaped && !obj.isDisabled()
            const canAct = obj.numActionsRemaining > 0
            ce({parent:container, style: {margin: 'auto'}, children:[
                this.cvs.getObject(`ship${index}`)?.asImage(25, COLORS.LightGreen) || null
            ]})
            ce({parent:container, innerHTML: `Hull: ${statColorSpan(Math.round(100 * hull[0]/hull[1]), hull[0]/hull[1], true)}%`})
            ce({parent:container, innerHTML: `Shields: ${statColorSpan(Math.round(100 * obj.shields[0]/obj.shields[1]), shields[0]/shields[1], true)}%`})
            ce({parent:container, innerHTML: obj.isDisabled() ? `(Disabled)` : obj.escaped ? '(Escaped)' : ''})
            if (showActions) {
                ce({parent:container, tag:'button', innerHTML:'Attack', disabled: !canAct, onClick: ()=>this.startTargetingAttack(obj)})
                ce({parent:container, tag:'button', innerHTML:'Move', disabled: !canAct, onClick: ()=>this.startTargetingMove(obj)})
            }
        }
    }

    selectObject(obj = new Ship()) {
        console.log('selected:',obj)
        if (this.uiMode == UI_MODE.TargetingMove) return
        if (this.uiMode == UI_MODE.TargetingAttack) {
            //fill this in later
        }
        for (const obj of this.cvs.drawOrder) {
            if (obj.strokeColor == COLORS.Green) {
                obj.strokeColor = this.calcStrokeColorForShip(obj)
            }
        }
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

    calcStrokeColorForShip(ship = new Ship()) {
        if (ship == this.selectedObject) return COLORS.Green
        if (this.validTargets.includes(ship)) return COLORS.Yellow
        return COLORS.Black
    }

    calcCanBeControlled(ship = new Ship()) {
        const {activeTurnFleet, playerFleet} = this.encounter
        if (ship.fleet != activeTurnFleet) return false
        if (ship.numActionsRemaining <= 0) return false
        if (ship.fleet != playerFleet) return false
        return true
    }

    startTargetingAttack(attacker = new Ship()) {
        if (!this.calcCanBeControlled(attacker)) return
        this.uiMode = UI_MODE.TargetingAttack
        this.targetingAreas = []
        const {encounter, cvs} = this
        const {playerFleet, ships} = encounter
        //show targeting areas
        const targetingAngle = attacker.angle+Math.PI
        const attackRange = attacker.maxSensorDistance
        const [ax,ay] = rotatePoint(attacker.x + attackRange*0.66, attacker.y, attacker.x, attacker.y, attacker.angle) //use centroid
        const [tx,ty] = rotatePoint(attacker.x + attackRange/2, attacker.y, attacker.x, attacker.y, attacker.angle)
        const targetingTriangle = createEquilateralTrianglePoints(ax, ay, attackRange, targetingAngle+Math.PI/2, 'aroundCenter')
        const targetingCvsObject = cvs.addTriangle('targetingarea', tx, ty, attackRange, 4, [0,255,0,0.1], targetingAngle)
        const targetingCvsLine = cvs.addLine('targetingline', attacker.x, attacker.y, tx, ty, 2, COLORS.LightGreen)
        console.log('added targeting area:',targetingTriangle,attackRange,targetingCvsObject)
        for (const target of ships) {
            if (target.fleet == playerFleet || target.isDisabled() || target.escaped) continue
            if (!isPointWithinTriangle(target.x, target.y, targetingTriangle)) continue
            this.validTargets.push(target)
            //const targetIndex = ships.indexOf(target)
            //const targetCvsObj = cvs.getObject(`ship${targetIndex}`)
            //targetCvsObj.strokeColor = COLORS.Yellow
        }
        this.targetingAreas.push(targetingCvsObject)
        this.refresh()
        this.refreshCanvas(true)
    }

    startTargetingMove(mover = new Ship()) {
        if (!this.calcCanBeControlled(mover)) return
        this.uiMode = UI_MODE.TargetingMove
        this.targetingAreas = []
        const {cvs} = this
        //show targeting areas
        const targetingAngle = mover.angle
        const moveRange = mover.maxMoveDistance
        const [tx,ty] = rotatePoint(mover.x + moveRange/2, mover.y, mover.x, mover.y, targetingAngle)
        const ellipse = new Ellipse(mover.x, mover.y, moveRange/2, moveRange/4, targetingAngle+Math.PI/2)
        const targetingCvsObject = cvs.addFilledOval('targetingarea', ellipse.x, ellipse.y, ellipse.majorAxis, ellipse.minorAxis, 4, [0,255,0,0.1], ellipse.angle)
        const targetingCvsCircle = cvs.addEmptyCircle('targetingcircle', mover.x, mover.y, mover.radius, 4, COLORS.LightGreen, 2)
        this.targetingAreas.push(targetingCvsObject, targetingCvsCircle)
        this.cvs.onClickWorldXY = (toX, toY)=>this.finishTargetingMove(toX, toY, ellipse)
        this.cvs.onMouseMoveWorldXY = (x, y)=>this.targetMove(x, y, ellipse)
        this.refresh()
        this.refreshCanvas(true)
    }

    targetMove(x = 0, y = 0, ellipse = new Ellipse()) {
        if (!isPointInEllipse(x, y, ellipse)) {
            return;
        }
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        targetingCvsCircle.x = x
        targetingCvsCircle.y = y
        this.refreshCanvas(true)
    }

    finishTargetingMove(toX = 0, toY = 0, ellipse = new Ellipse()) {
        this.stopTargeting()
    }

    stopTargeting() {
        this.cvs.onClickWorldXY = null;
        this.uiMode = UI_MODE.Default
        this.validTargets = []
        this.targetingAreas = []
        this.cvs.deleteObject('targetingarea')
        this.cvs.deleteObject('targetingline')
        this.refresh()
        this.refreshCanvas(true)
    }

    tick() {
        if (this.paused || gs.encounter.result || !gs.encounter.combatEnabled) return

        const currentTime = Date.now()
        this.lastTickMs = currentTime

        if (gs.encounter.result) {
            endCombat()
            return
        }

        this.refreshAnimations(currentTime/200000) //hack to make stars twinkle at a reasonable speed
        this.refreshCanvas()
        //this.refreshObjectPane();

        requestAnimationFrame(()=>this.tick())
    }

    onHail() {
        if (gs.encounter.combatEnabled) {
            this.togglePause(true)
            showModal(`Surrender?`, `Surrender to the ${gs.encounter.encounterType.name}?`, [
                ['Surrender', ()=>gs.encounter.encounterType.onSurrender()],
                ['Cancel', ()=>closeModal()]
            ])
        }
        else gs.encounter.encounterType.onStart()
    }
}



function showEncounterMap() {
    const encounterMap = new EncounterMap(gs.encounter, gs.fleet.ships[0])
    showMap(encounterMap)
}

