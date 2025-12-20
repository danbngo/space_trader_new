class EncounterMap {
    constructor(encounter = new Encounter(), autoSelectObject = encounter.playerShips[0]) {
        this.starSystem = gs.system
        this.encounter = encounter
        this.selectedObject = autoSelectObject || encounter.playerShips[0];

        this.lastTickMs = Date.now()
        this.maxMsPerTick = 100
        this.paused = false

        const baseZoom = ENCOUNTER_MAP_RADIUS_MILES/2
        this.cvs = new CanvasWrapper(baseZoom, baseZoom/10, baseZoom*10, encounter.mapDimensions)
        this.root = ce({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.controls = ce({parent: this.root, style: {position: 'absolute', top: 0, left: 0}})
        this.infoBar = ce({parent: this.root, style:{position:'absolute', bottom: 0, left: 0}})
        this.objectPane = ce({parent: this.root, style: {position: 'absolute', top: 0, right: 0, height: '100%', pointerEvents: 'none'}})

        this.uiMode = UI_MODE.Default;
        this.targetingLabel = '';
        this.targetingAreas = [];
        this.validTargets = [];
        this.animations = [];
        this.onSelectObject = null;
        this.onHoverObject = null;

        this.rebuildCanvas();
        this.refresh(true)
        window.addEventListener("resize", ()=>this.cvs.autoResize());
        
        requestAnimationFrame(()=> requestAnimationFrame(()=>{
            this.cvs.autoResize();
            this.selectObject(autoSelectObject || encounter.playerShips[0])
            this.refresh(true);
        }));
    }

    refresh() {
        this.checkTurnOver();
        this.refreshControls();
        this.refreshInfoBar();
        this.refreshObjectPane();
        this.refreshCanvas(true);
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

    refreshControls() {
        this.controls.innerHTML = ""
        ce({
            parent:this.controls,
            classNames: ['starmap-buttons'],
            children: [
                ce({tag:'button', innerHTML:this.paused ? '▶' : '⏸', onClick: () => this.togglePause()}),
                ce({tag:'button', innerHTML:'+', onClick: () => this.cvs.adjustZoom(1.33)}),
                ce({tag:'button', innerHTML:'-', onClick: () => this.cvs.adjustZoom(0.66)}),
                //ship info button?
                ce({tag:'button', innerHTML: '🗨', onClick: ()=> this.onHail(), disabled: (this.uiMode == UI_MODE.Animating)})
            ]
        })
    }

    refreshInfoBar() {
        const {encounter} = this
        this.infoBar.innerHTML = ""
        let msg = encounter.encounterType.name
        if (encounter.combatEnabled) {
            msg += ` - Turn: ${encounter.activeTurnFleet === encounter.playerFleet ?
                colorSpan('Player', colorArrToRgbaString(COLORS.LightGray)) : colorSpan('Enemy', colorArrToRgbaString(COLORS.LightRed))}`
        }
        ce({
            parent:this.infoBar,
            classNames: ['starmap-info-bar'],
            children: [
                msg
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
            const shipObj = cvs.addTriangle(`ship${index}`, ship.x, ship.y, ship.radius, ship.radius, 12, ship.color, ship.angle, ()=>this.selectObject(ship), true)
            shipObj.onHover = ()=>this.hoverObject(ship)
            if (ship == this.selectedObject) shipObj.strokeColor = COLORS.Green
            cvs.addEmptyCircle(`shipshield${index}`, ship.x, ship.y, ship.radius*1.1, 10, COLORS.Blue, 1)
            const labelObj = cvs.addText(`shiplabel${index}`, ship.x, ship.y, 0, -32, ship.shipType.name, ship.color, DEFAULT_FONT_SIZE, 2, ()=>this.selectObject(ship))
            labelObj.onHover = ()=>this.hoverObject(ship)
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

            if (invisible) {
                cvsShipObject.visible = false
                cvsShieldObject.visible = false
                cvsLabelObject.visible = false
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

            const label = ship.shipType.name
            let fontModifier = null
            if (ship.isDisabled()) fontModifier = 'italic'
            else if (ship.fleet != activeTurnFleet) fontModifier = 'italic'
            else {
                if (ship.numMovesRemaining == 0) fontModifier = null
                else fontModifier = 'bold'
            }
            cvsLabelObject.textContent = label
            cvsLabelObject.fontModifier = fontModifier
        })

        cvs.redraw(forceRedraw)
    }

    refreshBackground(year = 0) {
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
        const {playerFleet, combatEnabled, activeTurnFleet, ships} = encounter

        const obj = selectedObject
        this.objectPane.innerHTML = '';

        const container = ce({parent:this.objectPane, classNames:['starmap-object-panel']})

        if (this.uiMode == UI_MODE.Targeting) {
            ce({parent:container, innerHTML: `${obj.shipType.name}: Targeting ${this.targetingLabel}`})
            ce({parent:container, innerHTML: '(Select target)'})
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
            const index = ships.indexOf(obj)
            const {hull, shields} = obj
            const showMoves = combatEnabled && obj.fleet == playerFleet && !obj.escaped && !obj.isDisabled() && activeTurnFleet == playerFleet
            const canAct = obj.numMovesRemaining > 0
            ce({parent:container, style: {margin: 'auto'}, onClick: ()=>this.selectObject(obj), children:[
                this.cvs.getObject(`ship${index}`)?.asImage(25, COLORS.LightGreen) || null
            ]})
            ce({parent:container, innerHTML: `Hull: ${statColorSpan(Math.round(100 * hull[0]/hull[1]), hull[0]/hull[1], true)}%`})
            ce({parent:container, innerHTML: `Shields: ${statColorSpan(Math.round(100 * obj.shields[0]/obj.shields[1]), shields[0]/shields[1], true)}%`})
            ce({parent:container, innerHTML: `Moves: ${statColorSpan(obj.numMovesRemaining, obj.numMovesRemaining/2, true)}`})
            ce({parent:container, innerHTML: obj.isDisabled() ? `(Disabled)` : obj.escaped ? '(Escaped)' : ''})
            if (showMoves) {
                ce({parent:container, tag:'button', innerHTML:'Attack', disabled: !canAct, onClick: ()=>this.startTargetingAttack(obj)})
                ce({parent:container, tag:'button', innerHTML:'Move', disabled: !canAct, onClick: ()=>this.startTargetingMove(obj)})
            }
        }
    }

    selectObject(obj = new Ship()) {
        console.log('selected:',obj)
        if (this.onSelectObject) this.onSelectObject(obj);
        //if (this.uiMode !== UI_MODE.Default) return
        for (const obj of this.cvs.drawOrder) {
            if (obj.strokeColor == COLORS.Green) {
                obj.strokeColor = this.calcStrokeColorForShip(obj)
            }
        }
        this.selectedObject = obj;
        this.cvs.moveCameraTo(obj.x, obj.y)
        this.refresh();
    }

    hoverObject(obj = new Ship()) {
        if (this.onHoverObject) this.onHoverObject(obj);
    }

    calcStrokeColorForShip(ship = new Ship()) {
        if (ship == this.selectedObject) return COLORS.Green
        if (this.validTargets.includes(ship)) return COLORS.Yellow
        return COLORS.Black
    }

    calcCanBeControlled(ship = new Ship()) {
        const {activeTurnFleet, playerFleet} = this.encounter
        if (ship.fleet != activeTurnFleet) return false
        if (ship.numMovesRemaining <= 0) return false
        if (ship.fleet != playerFleet) return false
        return true
    }

    startTargetingAttack(attacker = new Ship()) {
        if (!this.calcCanBeControlled(attacker)) return
        const {cvs} = this

        this.uiMode = UI_MODE.TargetingAttack
        this.targetingAreas = []
        const [t1, t2] = attacker.calcAttackAreas()
        const targetingCvsObject1 = cvs.addTriangle('targetingarea', t1.x, t1.y, t1.base, t1.height, 4, [0,255,0,0.1], t1.angle)
        const targetingCvsObject2 = cvs.addTriangle('targetingarea2', t2.x, t2.y, t2.base, t2.height, 4, [0,255,0,0.1], t2.angle)
        const targetingCvsCircle = cvs.addEmptyCircle('targetingcircle', 0, 0, 0, 12, COLORS.LightGreen, 2)
        targetingCvsCircle.visible = false

        this.validTargets = this.encounter.calcAttackAreas(attacker)
        if (this.validTargets.length > 0) this.targetAttack(this.validTargets[0])
        this.onHoverObject = (hoveredObj)=>this.targetAttack(hoveredObj)
        this.onSelectObject = (selectedObj)=>this.attemptAttack(attacker, selectedObj)
        this.startTargeting('Attack', [targetingCvsObject1, targetingCvsObject2, targetingCvsCircle], this.validTargets)
    }

    targetAttack(target = new Ship()) {
        if (!this.validTargets.includes(target)) return
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x: target.x, y: target.y, radius: target.radius})
        this.refreshCanvas()
    }

    attemptAttack(attacker = new Ship(), target = new Ship()) {
        console.log('finishing attack on:',attacker,target)
        if (!this.validTargets.includes(target)) {
            return
        }
        this.exectuteAttack(attacker, target)
    }

    executeAttack(attacker = new Ship(), target = new Ship()) {
        const {cvs, animations} = this
        const move = new ShipMove(MOVE_TYPES.Attack, attacker, target)
        const path = move.path
        const animLine = cvs.addLine('laserline', 0, 0, 0, 0, COLORS.Red, 2)
        const laserDuration = (500 + 30*calcDistance(attacker.x, attacker.y, target.x, target.y))/2
        animations.push(new Loop(laserDuration, (progressRatio)=>{
            const [x2, y2] = path.positionAtProgress(Math.min(progressRatio * 1.25))
            const [x, y] = path.positionAtProgress(Math.max(0, progressRatio*1.25 - 0.25))
            Object.assign(animLine, {x, y, x2, y2})
        }, ()=>{
            move.execute()
            cvs.deleteObject(animLine)
            this.refresh()
        }))
        this.startAnimating()
    }

    startTargetingMove(mover = new Ship()) {
        if (!this.calcCanBeControlled(mover)) return
        const {cvs} = this
        const ellipse = mover.calcMoveArea()
        const targetingCvsObject = cvs.addFilledOval('targetingarea', ellipse.x, ellipse.y, ellipse.radiusX, ellipse.radiusY, 4, [0,255,0,0.1], ellipse.angle)
        console.log('created targeting cvs object:',targetingCvsObject, ellipse)
        const targetingCvsCircle = cvs.addEmptyCircle('targetingcircle', ellipse.x, ellipse.y, mover.radius, 4, COLORS.LightGreen, 2)
        this.cvs.onClickWorldXY = (x, y)=>this.attemptMove(x, y, ellipse, mover)
        this.cvs.onMouseMoveWorldXY = (x, y)=>this.targetMove(x, y, ellipse)
        this.startTargeting('Move', [targetingCvsObject, targetingCvsCircle])
    }

    targetMove(x = 0, y = 0, ellipse = new Ellipse()) {
        if (!ellipse.containsPoint(x, y)) {
            return;
        }
        const targetingCvsCircle = this.cvs.getObject('targetingcircle')
        Object.assign(targetingCvsCircle, {visible: true, x, y})
        this.refreshCanvas()
    }

    attemptMove(x = 0, y = 0, ellipse = new Ellipse(), mover = new Ship()) {
        console.log('finishing move to:',x,y,ellipse,mover)
        if (!ellipse.containsPoint(x, y)) {
            return
        }
        this.exectuteMove(new ShipMove(MOVE_TYPES.Move, mover, null, x, y))
    }

    exectuteMove(move = new ShipMove()) {
        const {cvs, animations} = this
        const mover = move.actor
        mover.angle = move.path.angle
        
        const animLine = cvs.addLine('moveline', move.path.startX, move.path.startY, move.path.endX, move.path.endY, mover.color, 1)
        const animThruster = cvs.addTriangle(`moveengine`, mover.x, mover.y, mover.radius*0.5, mover.radius*0.5, 6, COLORS.Orange, mover.angle - Math.PI)

        animations.push(new Loop(2000, (progressRatio)=>{
            const [newX, newY] = move.path.positionAtProgress(progressRatio)
            const [engineXOffset, engineYOffset] = rotatePoint(10, 0, 0, 0, mover.angle-Math.PI)
            Object.assign(mover, {x: newX, y: newY, angle:move.path.angle})
            Object.assign(animThruster, {x: newX, screenOffsetX: engineXOffset, y: newY, screenOffsetY: engineYOffset, angle: move.path.angle-Math.PI})
        }, ()=>{
            move.execute()
            cvs.deleteObject(animLine)
            cvs.deleteObject(animThruster)
            this.refresh()
        }))
        this.startAnimating()
    }

    startAnimating() {
        this.stopTargeting()
        this.togglePause(false)
        this.uiMode = UI_MODE.Animating
        this.refresh()
        this.refreshCanvas(true)
    }

    startTargeting(label = '', targetingAreas = [], validTargets = []) {
        this.uiMode = UI_MODE.Targeting
        this.targetingLabel = label
        this.targetingAreas = targetingAreas
        this.validTargets = validTargets
        this.refresh()
        this.refreshCanvas(true)
    }

    stopTargeting() {
        this.uiMode = UI_MODE.Default
        for (const cvsObj of this.targetingAreas) this.cvs.deleteObject(cvsObj)
        this.cvs.onClickWorldXY = null;
        this.cvs.onMouseMoveWorldXY = null;
        this.validTargets = []
        this.targetingAreas = []
        this.refresh()
        this.refreshCanvas(true)
    }

    handleAnimations(currentMs = Date.now()) {
        for (const animation of this.animations) {
            animation.update(currentMs)
        }
        this.animations = this.animations.filter(a => !a.completed)
        if (this.animations.length == 0 && this.uiMode == UI_MODE.Animating) {
            this.uiMode = UI_MODE.Default
            this.refresh()
        }
    }

    tick() {
        if (this.encounter.result) return
        if (this.paused) return

        const currentTime = Date.now()
        this.lastTickMs = currentTime

        if (this.encounter.result) {
            endCombat()
            return
        }

        this.refreshBackground(currentTime/200000) //hack to make stars twinkle at a reasonable speed
        this.refreshCanvas()
        console.log('ui mode:',this.uiMode)
        if (this.uiMode == UI_MODE.Animating) this.handleAnimations(currentTime)
        else {
            if (this.encounter.activeTurnFleet === this.encounter.enemyFleet) {
                this.handleEnemyMoves()
            }
        }
        //this.refreshObjectPane();

        requestAnimationFrame(()=>this.tick())
    }

    handleEnemyMoves() {
        const {encounter} = this
        const {ai} = encounter
        const nextMove = ai.calcNextMove()
    }

    checkTurnOver() {
        const {encounter} = this
        if (encounter.isTurnOver()) {
            encounter.handleTurnOver()
            this.refresh()
        }
    }

    onHail() {
        if (gs.encounter.combatEnabled) {
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

