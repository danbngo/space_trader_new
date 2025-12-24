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
        this.initializeDOM(baseZoom/2, baseZoom/10, baseZoom*10, encounter.mapRadius)

        // Initialize action handlers
        this.attackHandler = new LaserActionHandler(this);
        this.moveHandler = new MoveActionHandler(this);
        this.ramHandler = new RamActionHandler(this);
        this.rechargeHandler = new RechargeActionHandler(this);
        this.waitHandler = new WaitActionHandler(this);
        
        // Initialize module handlers
        /*this.cloakHandler = ;
        this.magnetizeHandler = new MagnetizeActionHandler(this);
        this.warheadHandler = new WarheadActionHandler(this);
        this.empPulseHandler = new EMPPulseActionHandler(this);
        this.blinkHandler = new BlinkActionHandler(this);
        this.boosterHandler = new BoosterActionHandler(this);
        this.smokeBombHandler = new SmokeBombActionHandler(this);*/

        this.moduleHandlerMap = new Map([
            [SHIP_MODULES.CLOAK, new CloakActionHandler(this)],
            [SHIP_MODULES.MAGNETIZE, new MagnetizeActionHandler(this)],
            [SHIP_MODULES.WARHEAD, new WarheadActionHandler(this)],
            [SHIP_MODULES.EMP_PULSE, new EMPPulseActionHandler(this)],
            [SHIP_MODULES.BLINK, new BlinkActionHandler(this)],
            [SHIP_MODULES.BOOSTER, new BoosterActionHandler(this)],
            [SHIP_MODULES.SMOKE_BOMB, new SmokeBombActionHandler(this)],
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
        this.checkTurnComplete();
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
                ce({tag:'button', innerHTML: '🗨', classNames: [(!this.encounter.combatEnabled ? 'highlighted' : null)], onClick: ()=> this.onHail(), disabled: (!this.encounter.encounterType.onSurrender)})
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
        const {ships, effects} = encounter
        const BG_STAR_DISTANCE_MOD = 10 //hacky way to position stars intended for starmap onto the encounter map

        cvs.clear()

        cvs.addEmptyCircle('maplimits', 0, 0, this.encounter.mapRadius, 24, COLORS.Cyan)

        starSystem.backgroundStars.forEach( (bgStar, index) => {
            cvs.addPixel(bgStar.x*BG_STAR_DISTANCE_MOD, bgStar.y*BG_STAR_DISTANCE_MOD, bgStar.color, bgStar.size)
        });

        ships.forEach((ship,index) => {
            let shipObj;
            if (ship.shipType.shape == SHAPES.FilledTriangle) {
                shipObj = cvs.addFilledTriangle(`ship${index}`, ship.x, ship.y, ship.radius, ship.radius, 12, ship.color, ship.angle, ()=>this.selectObject(ship))
            }
            else if (ship.shipType.shape == SHAPES.FilledOval) {
                shipObj = cvs.addFilledOval(`ship${index}`, ship.x, ship.y, ship.radius, (ship.radius*(Math.random()+0.5)), 0.5, ship.color, ship.angle, ()=>this.selectObject(ship))
                console.log('ship obj:', shipObj)
            }
            else if (ship.shipType.shape == SHAPES.FilledCircle) {
                shipObj = cvs.addFilledCircle(`ship${index}`, ship.x, ship.y, ship.radius, 12, ship.color, ()=>this.selectObject(ship))
            }
            shipObj.onHover = ()=>this.hoverObject(ship)
            //if (ship == this.selectedObject) shipObj.strokeColor = COLORS.Green
            cvs.addEmptyCircle(`shipshield${index}`, ship.x, ship.y, ship.radius*1.1, 10, COLORS.Blue, 1)
            const labelObj = cvs.addText(`shiplabel${index}`, ship.x, ship.y, 0, -32, ship.shipType.name, ship.color, DEFAULT_FONT_SIZE, 2, ()=>this.selectObject(ship))
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
            const animThruster = this.cvs.addFilledTriangle(`shipthruster${index}`, ship.x, ship.y, ship.radius*0.5, ship.radius*0.5, 6, COLORS.Orange, ship.angle - Math.PI)
        })

        cvs.recalculateDrawOrder()
    }

    addEffectCanvasObject(effect = new Effect()) {
        if (effect.effectType.shape == SHAPES.FilledOval) {
            const minorAxis = effect.radius * 0.5
            this.cvs.addFilledOval(`effect${effect.uuid}`, effect.x, effect.y, effect.radius, minorAxis, 0.5, effect.effectType.color, effect.angle)
        }
        else if (effect.effectType.shape == SHAPES.Line) {
            const cvsObj = this.cvs.addLine(`effect${effect.uuid}`, effect.x, effect.y, effect.toX, effect.toY, effect.effectType.color, effect.radius)
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
            const cvsShipObject = cvs.getObject(`ship${index}`)
            const cvsShieldObject = cvs.getObject(`shipshield${index}`)
            const cvsLabelObject = cvs.getObject(`shiplabel${index}`)
            const cvsThrusterObject = cvs.getObject(`shipthruster${index}`)

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
            //const hull255 = Math.round(255*hullRatio)
            //const shields255 = Math.round(255*shieldsRatio)

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
                if (ship.numActionsRemaining == 0) fontModifier = null
                else fontModifier = 'bold'
            }
            cvsLabelObject.fontModifier = fontModifier
        })

        effects.forEach( (effect, index) => {
            const cvsEffectObject = cvs.getObject(`effect${effect.uuid}`)
            if (!cvsEffectObject) {
                this.addEffectCanvasObject(effect)
                return
            }
            cvsEffectObject.x = effect.x
            cvsEffectObject.y = effect.y
            cvsEffectObject.size = effect.radius
            if (effect.effectType.shape == SHAPES.FilledOval) {
                cvsEffectObject.angle = effect.angle
                cvsEffectObject.minorSize = effect.radius * 0.5
            }
            else if (effect.effectType.shape == SHAPES.Line) {
                cvsEffectObject.toX = effect.toX
                cvsEffectObject.toY = effect.toY
            }
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

        if (!this.selectedObject) {
            return;
        }

        if (this.targetingLabel && this.targetingLabel.length > 0) {
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
            const index = ships.indexOf(obj)
            const {hull, shields} = obj
            
            const showActions = combatEnabled && obj.fleet == playerFleet && !obj.escaped && !obj.disabled && activeTurnFleet == playerFleet
            console.log('showing actions with props:', { combatEnabled, isPlayerShip: obj.fleet == playerFleet, isEscaped: obj.escaped, isDisabled: obj.disabled, isPlayerTurn: activeTurnFleet == playerFleet })
            const canAct = (obj.numActionsRemaining > 0) && (this.animations.length <= 0)
            const canRecharge = obj.shields[0] < obj.shields[1]
            ce({parent:container, style: {margin: 'auto'}, onClick: ()=>this.selectObject(obj), children:[
                this.cvs.getObject(`ship${index}`)?.asImage(25, COLORS.LightGreen) || null
            ]})
             // Display status effects if any
            if (obj.statusEffects.size > 0) {
                const statusEffectSpans = Array.from(obj.statusEffects.keys).map(effect => {
                    return colorSpan(effect.name, colorArrToRgbaString(effect.color))
                })
                ce({parent:container, innerHTML: statusEffectSpans.join(' | ')})
            }
            ce({parent:container, innerHTML: `Hull: ${statColorSpan(`${hull[0]}/${hull[1]}`, hull[0]/hull[1], true)}`})
            if (obj.shields[1] > 0) ce({parent:container, innerHTML: `Shields: ${statColorSpan(`${shields[0]}/${shields[1]}`, shields[0]/shields[1], true)}`})
            if (obj.lasers > 0) ce({parent:container, innerHTML: `Lasers: ${statColorSpan(obj.lasers, obj.lasers/AVERAGE_SHIP_LASERS, true)}`})
            if (obj.engine) ce({parent:container,  innerHTML: `Engine: ${statColorSpan(obj.engine, obj.engine/AVERAGE_SHIP_ENGINE, true)}`})
            if (obj.radars) ce({parent:container, innerHTML: `Radars: ${statColorSpan(obj.radars, obj.radars/AVERAGE_SHIP_RADARS, true)}`})
            ce({parent:container, innerHTML: `Actions: ${statColorSpan(obj.numActionsRemaining, obj.numActionsRemaining/2, true)}`})
            ce({parent:container, innerHTML: obj.disabled ? `(Disabled)` : obj.escaped ? '(Escaped)' : ''})
            if (showActions) {
                ce({parent:container, tag:'button', innerHTML:'Attack', disabled: !canAct, onClick: ()=>this.attackHandler.startTargeting(obj)})
                ce({parent:container, tag:'button', innerHTML:'Move', disabled: !canAct, onClick: ()=>this.moveHandler.startTargeting(obj)})
                ce({parent:container, tag:'button', innerHTML:'Ram', disabled: !canAct, onClick: ()=>this.ramHandler.startTargeting(obj)})
                ce({parent:container, tag:'button', innerHTML:canRecharge ? 'Recharge' : 'Wait', disabled: !canAct, onClick: ()=>{
                    if (canRecharge) this.rechargeHandler.attempt(obj)
                    else this.waitHandler.attempt(obj)
                }})
                
                // Module buttons - iterate through all ship modules
                const isIonized = obj.statusEffects.has(STATUS_EFFECTS.IONIZED)

                for (const [module, handler] of this.moduleHandlerMap) {
                    if (obj.modules.includes(module)) {
                        const cooldown = obj.moduleCooldowns.getAmount(module)
                        const onCooldown = cooldown > 0
                        const label = cooldown > 0 ? `${module.name} (${cooldown})` : module.name
                        ce({parent:container, tag:'button', innerHTML:label, disabled: !canAct || onCooldown || isIonized, onClick: ()=>{
                            handler.startTargeting(obj)
                        }})
                    }
                }
            }
        }
    }

    selectObject(obj = new Ship()) {
        console.log('selected:',obj)
        if (this.onSelectObject) this.onSelectObject(obj);
        //if (this.uiMode !== UI_MODE.Default) return
        this.selectedObject = obj;
        this.cvs.moveCameraTo(obj.x, obj.y)
        this.refreshStrokeColors()
        this.refresh();
    }

    refreshStrokeColors() {
        for (let i = 0; i < this.encounter.ships.length; i++) {
            const obj = this.cvs.getObject(`ship${i}`)
            obj.strokeColor = this.calcStrokeColorForObj(this.encounter.ships[i])
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
        if (ship.numActionsRemaining <= 0) return false
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
            if (nextMove.actionType == MOVE_TYPES.Move) {
                this.moveHandler.execute(nextMove)
            }
            else if (nextMove.actionType == MOVE_TYPES.Laser) {
                this.attackHandler.execute(nextMove)
            }
            else if (nextMove.actionType == MOVE_TYPES.Recharge) {
                this.rechargeHandler.execute(nextMove)
            }
            else if (nextMove.actionType == MOVE_TYPES.Ram) {
                this.ramHandler.execute(nextMove)
            }
            else if (nextMove.actionType == MOVE_TYPES.Wait) {
                this.waitHandler.execute(nextMove)
            }
        }
        this.checkTurnComplete()
    }

    checkTurnComplete() {
        //console.log('EncounterMap.checkTurnComplete')
        if (this.encounter.result) return
        const {encounter} = this
        if (encounter.isTurnComplete()) {
            encounter.handleTurnComplete()
            for (let i = 0; i < encounter.activeTurnFleet.activeShips.length; i++) {
                const ship = encounter.activeTurnFleet.activeShips[i]
                if (ship.numActionsRemaining > ship.maxActionsPerTurn) {
                    const txt = this.cvs.addText(`fast_${i}`, ship.x, ship.y, 0, -DEFAULT_FONT_SIZE, 'Fast!', COLORS.LightGreen)
                    txt.setDurationMs()
                }
                else if (ship.numActionsRemaining < ship.maxActionsPerTurn) {
                    const txt = this.cvs.addText(`slow_${i}`, ship.x, ship.y, 0, -DEFAULT_FONT_SIZE, 'Slow!', COLORS.LightRed)
                    txt.setDurationMs() 
                }
            }
            this.refreshLogic()
            if (encounter.activeTurnFleet == gs.fleet) this.selectObject(encounter.playerShips[0] || null)
        }
    }

    checkEncounterOver() {
        console.log('checking encounter over')
        if (this.encounter.result) {
            endCombat()
            return true
            //this.refresh()
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

