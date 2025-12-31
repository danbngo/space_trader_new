class EncounterMap extends BaseMap {
    constructor(encounter = new Encounter(), autoSelectObject = encounter.playerShips[0]) {
        super()
        this.starSystem = gs.system
        this.encounter = encounter
        this.paused = false // Override default paused state for encounters

        this.targetingLabel = '';
        this.targetingAreas = [];
        this.validTargets = [];
        this.animations = [];
        this.onSelectObject = null;
        this.onHoverObject = null;

        // Combat popup text - Map of id -> {textContent, color, endMs, x, y}
        this.popups = new Map();

        const baseZoom = ENCOUNTER_MAP_RADIUS_MILES/2
        this.initializeDOM(baseZoom/10, baseZoom/10, baseZoom*10, encounter.mapRadius)

        // @ts-ignore
        this.moveHandlerMap = new Map([
            [MOVE_TYPES.Laser, new LaserActionHandler(this)],
            [MOVE_TYPES.Move, new MoveActionHandler(this)],
            [MOVE_TYPES.Ram, new RamActionHandler(this)],
            [MOVE_TYPES.Recharge, new RechargeActionHandler(this)],
            [MOVE_TYPES.Wait, new WaitActionHandler(this)],
            [MOVE_TYPES.Cloak, new CloakActionHandler(this)],
            [MOVE_TYPES.Magnetize, new MagnetizeActionHandler(this)],
            [MOVE_TYPES.Warhead, new WarheadActionHandler(this)],
            [MOVE_TYPES.EMPPulse, new EMPPulseActionHandler(this)],
            [MOVE_TYPES.Blink, new BlinkActionHandler(this)],
            [MOVE_TYPES.Booster, new BoosterActionHandler(this)],
            [MOVE_TYPES.SmokeBomb, new SmokeBombActionHandler(this)],
        ])
        
        this.animatingAction = null

        this.rebuildCanvas()
        this.refresh()
        this.selectObject(autoSelectObject || encounter.playerShips[0])
    }
    
    onDeferredInit() {
        this.cvs.autoResize()
        this.selectObject(this.encounter.playerShips[0])
        this.refresh()
    }

    refresh() {
        console.log('refreshing encounterMap')
        this.refreshControls();
        this.refreshInfoBar();
        this.refreshObjectPane();
        this.refreshCanvas(true);
    }

    refreshLogic() {
        console.log('EncounterMap.refreshLogic:',this.animations)
        //dont do anything while animating
        if (this.animations.length > 0) return;
        if (this.checkEncounterOver()) return;
        if (this.checkTurnComplete()) {
            //this.rebuildCanvas() //in case new ships were added
            this.refreshCanvas(true)
        }
        this.handleEnemyActions()
    }

    togglePause(newPausedState = !this.paused) {
        console.log('setting paused to:',newPausedState)
        this.paused = newPausedState
        if (!this.paused) {
            this.lastTickMs = Date.now()
            this.tick()
        }
        this.refresh() //always do first refresh, as fleets launch during pause/unpause
        this.refreshLogic()
    }

    refreshControls() {
        this.controls.innerHTML = ""
        ce({
            parent:this.controls,
            classNames: ['starmap-buttons'],
            children: [
                (this.encounter.combatEnabled ? ce({tag:'button', innerHTML:this.paused ? '▶' : '⏸', classNames: [(this.paused) ? 'highlighted' : null], onClick: () => this.togglePause()}) : null),
                ce({tag:'button', innerHTML:'+', onClick: () => this.cvs.adjustZoom(1.33)}),
                ce({tag:'button', innerHTML:'-', onClick: () => this.cvs.adjustZoom(0.66)}),
                //ship info button?
                ce({tag:'button', innerHTML: '🗨', classNames: [(!this.encounter.combatEnabled ? 'highlighted' : null)], onClick: ()=> this.onHail(), disabled: false})
            ]
        })
    }

    refreshInfoBar() {
        const {encounter} = this
        this.infoBar.innerHTML = ""
        let msg = encounter.encounterType.name
        if (encounter.combatEnabled) {
            msg += ` - Turn: ${encounter.activeTurnFleet === encounter.playerFleet ?
                colorSpan('Player', COLORS.LightGray) : colorSpan('Enemy', COLORS.LightRed)}`
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
        const BG_STAR_DISTANCE_MOD = 10 //hacky way to position stars intended for starmap onto the encounter map

        cvs.clear()

        if (!cvs.getObject('maplimits')) cvs.addEmptyCircle('maplimits', 0, 0, this.encounter.mapRadius, 24, COLORS.Cyan)

        if (cvs.pixels.length <= 0) starSystem.backgroundStars.forEach( (bgStar, index) => {
            cvs.addPixel(bgStar.x*BG_STAR_DISTANCE_MOD, bgStar.y*BG_STAR_DISTANCE_MOD, bgStar.color, bgStar.radius)
        });

        ships.forEach((ship,index) => {
            const shipId = `ship${ship.uuid}`
            let shipObj = cvs.getObject(shipId)
            if (shipObj) return
            console.log('rebuilding ship:',shipId,shipObj,ship)
            if (ship.shipType.shape == SHAPES.FilledTriangle) {
                shipObj = cvs.addFilledTriangle(shipId, ship.x, ship.y, ship.radius, ship.radius, 12, ship.color, ship.angle, ()=>this.selectObject(ship))
            }
            else if (ship.shipType.shape == SHAPES.FilledOval) {
                shipObj = cvs.addFilledOval(shipId, ship.x, ship.y, ship.radius, (ship.radius*(Math.random()+0.5)), 0.5, ship.color, ship.angle, ()=>this.selectObject(ship))
                console.log('ship obj:', shipObj)
            }
            else if (ship.shipType.shape == SHAPES.FilledCircle) {
                shipObj = cvs.addFilledCircle(shipId, ship.x, ship.y, ship.radius, 12, ship.color, ()=>this.selectObject(ship))
            }
            else throw new Error('ship obj not created, must not have had a valid shape??')
            shipObj.onHover = ()=>this.hoverObject(ship)
            //if (ship == this.selectedObject) shipObj.strokeColor = COLORS.Green
            cvs.addEmptyCircle(shipId+'shield', ship.x, ship.y, ship.radius*1.1, 10, COLORS.Blue, 1)
            const labelObj = cvs.addText(shipId+'label', ship.x, ship.y, 0, -32, ship.shipType.name, ship.color, DEFAULT_FONT_SIZE, 2, ()=>this.selectObject(ship))
            labelObj.onHover = ()=>this.hoverObject(ship)
            const objs = [shipObj, labelObj]
            for (const obj of objs) {
                obj.onHover = ()=>{
                    labelObj.visible = true
                    for (const obj2 of objs) obj2.strokeColor = COLORS.Cyan
                }
                obj.onHoverEnd = ()=>{
                    labelObj.visible = false
                    for (const obj3 of objs) obj3.strokeColor = this.calcStrokeColorForObj(ship)
                }
                obj.onHoverEnd()
            }
            const thrusterColor = ship.aiType == AI_TYPES.Asteroid ? COLORS.Green : COLORS.Orange
            const animThruster = this.cvs.addFilledTriangle(shipId+'thruster', ship.x, ship.y, ship.radius*0.5, ship.radius*0.5, 6, thrusterColor, ship.angle - Math.PI)
        })

        cvs.recalculateDrawOrder()
    }

    addEffectCanvasObject(effect = new Effect()) {
        const onClick = ()=>{ this.selectObject(effect) }

        if (effect.effectType.shape == SHAPES.FilledOval) {
            const minorAxis = effect.radius * 0.5
            this.cvs.addFilledOval(`effect${effect.uuid}`, effect.x, effect.y, effect.radius, minorAxis, 0.5, effect.effectType.color, effect.angle, onClick)
        }
        else if (effect.effectType.shape == SHAPES.FilledRectangle) {
            const centerX = (effect.toX+effect.x)/2
            const centerY = (effect.toY+effect.y)/2
            const cvsObj = this.cvs.addFilledRectangle(`effect${effect.uuid}`, centerX, centerY, effect.path.distance, effect.radius, 2, effect.effectType.color, effect.angle, onClick)
            console.log('added line effect to canvas:', effect, cvsObj)
        }
    }

    refreshCanvas(forceRedraw = false) {
        const {encounter, cvs} = this
        const {ships, activeTurnFleet, effects} = encounter

        const now = Date.now()

        //draw objects
        ships.forEach( (ship, index) => {
            let invisible = ship.escaped
            if (ship.aiType == AI_TYPES.Asteroid && ship.disabled) invisible = true

            //if (obj.location) return //dont display docked fleets
            const shipId = `ship${ship.uuid}`
            const cvsShipObject = cvs.getObject(shipId)
            if (!cvsShipObject) {
                //console.log('WARNING: No ship object found!',index,ship)
                return
            }
            const cvsShieldObject = cvs.getObject(shipId+'shield')
            const cvsLabelObject = cvs.getObject(shipId+'label')
            const cvsThrusterObject = cvs.getObject(shipId+'thruster')

            let cloaked = false

            // Display cloaked ships as white with low alpha
            if (ship.statusEffects.has(STATUS_EFFECTS.CLOAKED)) {
                if (ship.fleet != encounter.playerFleet) {
                    invisible = true //enemy ships will be invisible
                }
                else cloaked = true
            }

            if (invisible) {
                cvsShipObject.visible = false
                cvsShieldObject.visible = false
                cvsLabelObject.visible = false
                cvsThrusterObject.visible = false
                return
            }

            const shieldsRatio = ship.shields[0] <= 0 ? 0 : 0.25+(0.75*ship.shields[0]/ship.shields[1])
            const hullRatio = 0.25 + (0.75*ship.hull[0]/ship.hull[1])

            cvsShipObject.x = ship.x
            cvsShipObject.y = ship.y
            cvsShipObject.angle = ship.angle
            
            // Display cloaked ships as white with low alpha
            if (cloaked) {
                cvsShipObject.fillColor[3] = 0.1
            } else {
                cvsShipObject.fillColor[3] = hullRatio
            }
            
            cvsShieldObject.x = ship.x
            cvsShieldObject.y = ship.y
            cvsShieldObject.strokeColor[3] = shieldsRatio
            cvsShieldObject.fillColor[3] = shieldsRatio

            cvsLabelObject.x = ship.x
            cvsLabelObject.y = ship.y

            const [xo, yo] = rotatePoint(ship.radius, 0, 0, 0, ship.angle-Math.PI)
            cvsThrusterObject.x = ship.x+xo
            cvsThrusterObject.y = ship.y+yo
            const [sxo, syo] = rotatePoint(4, 0, 0, 0, ship.angle-Math.PI)
            cvsThrusterObject.screenOffsetX = sxo
            cvsThrusterObject.screenOffsetY = syo
            cvsThrusterObject.angle = ship.angle - Math.PI
            
            // Oscillate thruster alpha based on engine speed
            const currentMs = Date.now()
            const engineSpeed = ship.engine / AVERAGE_SHIP_ENGINE // Normalize engine value
            const oscillationFreq = 0.005 * (0.005 + engineSpeed) // Faster engines = faster oscillation
            const alpha = 0.9 + 0.1 * Math.sin(currentMs * oscillationFreq)
            cvsThrusterObject.fillColor[3] = alpha
            
            //Object.assign(animThruster, {x: newX, screenOffsetX: engineXOffset, y: newY, screenOffsetY: engineYOffset, angle: action.path.angle-Math.PI})

            let fontModifier = null
            if (ship.disabled) {
                fontModifier = 'italic'
                cvsLabelObject.fillColor[3] = 0.5
            }
            else if (ship.fleet != activeTurnFleet) fontModifier = 'italic'
            else {
                if (ship.actionsRemaining == 0) fontModifier = null
                else fontModifier = 'bold'
            }
            cvsLabelObject.fontModifier = fontModifier
        })

        effects.forEach( (effect, index) => {
            const cvsEffectObject = cvs.getObject(`effect${effect.uuid}`)
            if (!cvsEffectObject) {
                this.addPlanetEffectCanvasObject(effect)
                return
            }
            if (effect.effectType.shape == SHAPES.FilledOval) {
                cvsEffectObject.x = effect.x
                cvsEffectObject.y = effect.y
                cvsEffectObject.angle = effect.angle
                cvsEffectObject.minorSize = effect.radius * 0.5
                cvsEffectObject.size = effect.radius
            }
            else if (effect.effectType.shape == SHAPES.FilledRectangle) {
                //cvsEffectObject.size = effect.path.distance
                cvsEffectObject.minorSize = effect.radius
            }

            // Oscillate effect alpha based on radius (larger effects pulse slower)
            const currentMs = Date.now()
            const radiusSpeed = effect.radius / 10 // Normalize radius value
            const oscillationFreq = 0.001 * (0.001 + radiusSpeed) // Larger radius = faster oscillation
            const alpha = 0.3 + (0.05 * Math.sin(currentMs * oscillationFreq))
            cvsEffectObject.fillColor[3] = alpha
        })

        // Remove canvas objects for effects that no longer exist
        const activeEffectIds = new Set(effects.map(e => `effect${e.uuid}`))
        const allCanvasObjects = Array.from(cvs.objectMap.keys())
        for (const objId of allCanvasObjects) {
            if (objId.startsWith('effect') && !activeEffectIds.has(objId)) {
                cvs.deleteObject(objId)
            }
        }

        this.handleAnimations(now)

        cvs.redraw(forceRedraw)
    }

    refreshBackground(year = 0) {
        const {starSystem, cvs} = this
        const {backgroundStars} = starSystem
        backgroundStars.forEach( (bgStar, index) => {
            bgStar.twinkle(year)
            cvs.pixels[index].a = bgStar.color[3];
        });
    }

    refreshObjectPane() {
        //const playerShips = gs.fleet.ships
        const {selectedObject, encounter} = this
        const {playerFleet, combatEnabled, activeTurnFleet, ships} = encounter

        const obj = selectedObject
        this.objectPane.innerHTML = '';

        const container = ce({parent:this.objectPane, classNames:['starmap-object-panel']})

        if (!obj) {
            return;
        }

        if (this.targetingLabel && this.targetingLabel.length > 0 && obj instanceof Ship) {
            ce({parent:container, innerHTML: `${obj.shipType.name}: Targeting ${this.targetingLabel}`})
            ce({parent:container, innerHTML: '(Select target)'})
            ce({parent:container, tag:'button', innerHTML:'Cancel', onClick: ()=>{
                this.stopTargeting()
            }})
            return;
        }

        ce({
            parent:container, tag:'h3', innerHTML: coloredName(obj), classNames: ['clickable-text'],
            style: {filter: `drop-shadow(1px 0 0 ${colorArrToRgbaString(COLORS.Green)}) drop-shadow(0 1px 0 ${colorArrToRgbaString(COLORS.Green)})  drop-shadow(0 -0.5px 0 ${colorArrToRgbaString(COLORS.Green)})  drop-shadow(-0.5px 0 0 ${colorArrToRgbaString(COLORS.Green)})`},
            onClick: ()=>this.selectObject(obj)
        })
        if (obj instanceof Ship) {
            const {hull, shields} = obj
            
            const showActions = combatEnabled && obj.fleet == playerFleet && !obj.escaped && !obj.disabled && activeTurnFleet == playerFleet
            console.log('showing actions with props:', { combatEnabled, isPlayerShip: obj.fleet == playerFleet, isEscaped: obj.escaped, disabled: obj.disabled, isPlayerTurn: activeTurnFleet == playerFleet })
            const canAct = (obj.actionsRemaining > 0) && (this.animations.length <= 0)
            ce({parent:container, style: {margin: 'auto'}, onClick: ()=>this.selectObject(obj), children:[
                this.cvs.getObject(`ship${obj.uuid}`)?.asImage(25, COLORS.LightGreen) || null
            ]})
             // Display status effects if any
            if (obj.statusEffects.size > 0) {
                const statusEffectSpans = obj.statusEffects.keys.map(effect=>{
                    const turnsRemaining = obj.statusEffects.getAmount(effect)
                    if (turnsRemaining > 0) return colorSpan(`${effect.name}${turnsRemaining > 0 ? ` (${turnsRemaining})` : ''}`, effect.color)
                    return ''
                })
                ce({parent:container, innerHTML: statusEffectSpans.join('<br/>')})
            }
            ce({parent:container, innerHTML: `Hull: ${statColorSpan(`${hull[0]}/${hull[1]}`, hull[0]/hull[1])}`})
            if (obj.shields[1] > 0) ce({parent:container, innerHTML: `Shields: ${statColorSpan(`${shields[0]}/${shields[1]}`, shields[0]/shields[1])}`})
            if (obj.lasers > 0) ce({parent:container, innerHTML: `Lasers: ${statColorSpan(obj.lasers, obj.lasers/AVERAGE_SHIP_LASERS)}`})
            if (obj.engine) ce({parent:container,  innerHTML: `Engine: ${statColorSpan(obj.engine, obj.engine/AVERAGE_SHIP_ENGINE)}`})
            if (obj.radars) ce({parent:container, innerHTML: `Radars: ${statColorSpan(obj.radars, obj.radars/AVERAGE_SHIP_RADARS)}`})
            ce({parent:container, innerHTML: `Actions: ${statColorSpan(obj.actionsRemaining, obj.actionsRemaining/2)}`})
            ce({parent:container, innerHTML: obj.disabled ? `(Disabled)` : obj.escaped ? '(Escaped)' : ''})
            if (showActions) {
                ce({parent:container, tag:'button', innerHTML:'Shoot', disabled: !canAct || !obj.canShoot, onClick: ()=>this.moveHandlerMap.get(MOVE_TYPES.Laser).startTargeting(obj)})
                ce({parent:container, tag:'button', innerHTML:'Move', disabled: !canAct, onClick: ()=>this.moveHandlerMap.get(MOVE_TYPES.Move).startTargeting(obj)})
                ce({parent:container, tag:'button', innerHTML:'Ram', disabled: !canAct || !obj.canRam, onClick: ()=>this.moveHandlerMap.get(MOVE_TYPES.Ram).startTargeting(obj)})
                ce({parent:container, tag:'button', innerHTML:'Recharge', disabled: !canAct || !obj.canRecharge, onClick: ()=>this.moveHandlerMap.get(MOVE_TYPES.Recharge).attempt(obj)})
                ce({parent:container, tag:'button', innerHTML:'Wait', disabled: !canAct, onClick: ()=>this.moveHandlerMap.get(MOVE_TYPES.Wait).attempt(obj)})
                
                for (const [move, handler] of this.moveHandlerMap) {
                    const module = SHIP_MODULE_TYPES_ALL.find(m => m.moveType === move)
                    if (!module) continue
                    if (!obj.moduleTypes.includes(module)) continue
                    const cooldown = obj.moduleCooldowns.getAmount(module)
                    const onCooldown = cooldown > 0
                    const label = cooldown > 0 ? `${move} (${cooldown})` : module.name
                    ce({parent:container, tag:'button', innerHTML:label, disabled: !canAct || onCooldown || !obj.canUseModules, onClick: ()=>{
                        handler.startTargeting(obj)
                    }})
                }
            }
        }
        else if (obj instanceof Effect) {
            ce({parent:container, style: {margin: 'auto'}, onClick: ()=>this.selectObject(obj), children:[
                this.cvs.getObject(`effect${obj.uuid}`)?.asImage(25, COLORS.LightGreen) || null
            ]})
        }
    }

    /** @param {Ship|Effect} obj */
    selectObject(obj = new Ship()) {
        console.log('selected:',obj)
        if (this.onSelectObject) this.onSelectObject(obj);
        //if (this.uiMode !== UI_MODE.Default) return
        this.selectedObject = obj;
        //dont zoom onto effects, they can be way offscreen
        if (obj instanceof Ship) this.cvs.moveCameraTo(obj.x, obj.y)
        this.refreshStrokeColors()
        this.refresh();
    }

    refreshStrokeColors() {
        for (const ship of this.encounter.ships) {
            const obj = this.cvs.getObject(`ship${ship.uuid}`)
            if (obj) obj.strokeColor = this.calcStrokeColorForObj(ship)
        }
    }

    hoverObject(obj = new Ship()) {
        if (this.onHoverObject) this.onHoverObject(obj);
    }

    calcStrokeColorForObj(ship = new Ship()) {
        if (ship == this.selectedObject) return COLORS.Green
        else if (this.validTargets.includes(ship)) return COLORS.Yellow
        else return COLORS.Black
    }

    calcCanBeControlled(ship = new Ship()) {
        const {activeTurnFleet, playerFleet} = this.encounter
        if (ship.fleet != activeTurnFleet) return false
        if (ship.actionsRemaining <= 0) return false
        if (ship.fleet != playerFleet) return false
        return true
    }

    startTargeting(label = '', targetingAreas = [], validTargets = []) {
        console.log('EncounterMap.startTargeting', { label, targetingAreas, validTargets });
        this.targetingLabel = label
        this.targetingAreas = targetingAreas
        this.validTargets = validTargets
        this.refresh()
        this.refreshStrokeColors()
        this.refreshCanvas(true)
    }

    stopTargeting() {
        console.log('EncounterMap.stopTargeting')
        for (const cvsObj of this.targetingAreas) this.cvs.deleteObject(cvsObj)
        this.cvs.onClickWorldXY = null;
        this.cvs.onMouseMoveWorldXY = null;
        this.validTargets = []
        this.targetingAreas = []
        this.targetingLabel = null
        this.refresh()
        this.refreshStrokeColors()
        this.refreshCanvas(true)
    }

    handleAnimations(currentMs = Date.now()) {
        for (const animation of this.animations) {
            animation.update(currentMs)
        }
        const completedAnimations = this.animations.filter(a => a.completed)
        if (completedAnimations.length > 0) {
            console.log('completed animations:',completedAnimations)
            this.animations = this.animations.filter(a => !a.completed)
            this.refresh()
            this.refreshLogic()
        }
    }

    tick() {
        if (this.paused) return

        const currentTime = Date.now()
        this.lastTickMs = currentTime

        this.refreshBackground(currentTime/200000) //hack to make stars twinkle at a reasonable speed
        this.refreshCanvas()

        requestAnimationFrame(()=>this.tick())
    }

    handleEnemyActions() {
        const {encounter} = this
        console.log('handle enemy actions called with uiMode:',this.paused,this.encounter.combatEnabled,encounter.activeTurnFleet)
        if (this.paused || !encounter.combatEnabled || encounter.activeTurnFleet == gs.fleet || this.encounter.result || this.animations.length > 0) return
        const {ai} = encounter
        const nextMove = ai.calcNextMove()
        console.log('determined next AI move:',nextMove)
        if (nextMove) {
            this.moveHandlerMap.get(nextMove.actionType).execute(nextMove)
        }
        this.checkTurnComplete()
    }

    checkTurnComplete() {
        //console.log('EncounterMap.checkTurnComplete')
        if (this.encounter.result) return
        const {encounter} = this
        const isComplete = encounter.isTurnComplete()
        if (!isComplete) return false
        encounter.handleTurnComplete()
        for (const ship of encounter.activeTurnFleet.activeShips) {
            if (ship.actionsRemaining > ship.maxActionsPerTurn) {
                const txt = this.cvs.addText(`fast_${ship.uuid}`, ship.x, ship.y, 0, -DEFAULT_FONT_SIZE, 'Fast!', COLORS.LightGreen)
                txt.setDurationMs()
            }
            else if (ship.actionsRemaining < ship.maxActionsPerTurn) {
                const txt = this.cvs.addText(`slow_${ship.uuid}`, ship.x, ship.y, 0, -DEFAULT_FONT_SIZE, 'Slow!', COLORS.LightRed)
                txt.setDurationMs() 
            }
        }
        this.refreshLogic()
        if (encounter.activeTurnFleet == gs.fleet) this.selectObject(encounter.playerShips[0] || null)
        return true
    }

    checkEncounterOver() {
        console.log('checking encounter over')
        if (this.encounter.result) {
            this.encounter.endCombat()
            return true
            //this.refresh()
        }
    }

    onHail() {
        if (gs.encounter.combatEnabled) {
            showModal(`Surrender?`, `Surrender to the ${coloredName(gs.encounter.fleet)}?`, [
                ['Surrender', ()=>gs.encounter.onSurrender()],
                ['Cancel', ()=>closeModal()]
            ])
        }
        else gs.encounter.onStart()
    }
}

function showEncounterMap() {
    const encounterMap = new EncounterMap(gs.encounter, gs.fleet.ships[0])
    showMap(encounterMap)
}

