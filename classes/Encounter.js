

class Encounter {
    constructor(gameState = new GameState(), encounterType = ENCOUNTER_TYPES_ALL[0], planet = new Planet(), fleet = new Fleet()) {
        this.encounterType = encounterType;
        this.planet = planet;
        this.fleet = fleet;
        this.combatEnabled = false;
        this.mapDimensions = ENCOUNTER_MAP_RADIUS_MILES;
        this.playerFleet = gameState.fleet
        this.playerShips = this.playerFleet.ships
        this.playerFlagship = this.playerFleet.flagship
        this.enemyFleet = this.fleet
        this.enemyShips = this.enemyFleet.ships
        this.enemyFlagship = this.enemyFleet.flagship
        this.ships = [...this.playerShips, ...this.enemyShips]
        this.projectiles = []
        this.ai = new EncounterAI(this)
        this.encounterInputHandler = new EncounterInputHandler(this)
        this.result = null //playerVictory, playerDefeat, playerSurrendered,
    }

    get disabledPlayerShips () { return this.playerShips.filter(s=>(s.isDisabled())) }
    get escapedPlayerShips () {return this.playerShips.filter(s=>(s.escaped)) }
    get escapedPlayerShips () {return this.playerShips.filter(s=>(s.escaped)) }
    get disabledEnemyShips () {return this.enemyShips.filter(s=>(s.isDisabled())) }
    get activePlayerShips () {return this.playerShips.filter(s=>(!s.isDisabled() && !s.escaped)) }
    get activeEnemyShips () {return this.enemyShips.filter(s=>(!s.isDisabled() && !s.escaped)) }
    get activeShips () {return this.ships.filter(s=>(!s.isDisabled() && !s.escaped)) }

    tick(elapsedSeconds = 0) {
        if (this.result) return
        this.handleObjectsOutOfBounds()
        this.refreshShipStatus(elapsedSeconds)
        this.applyPhysics(elapsedSeconds)
        //TODO: if ships/projectiles are moving too fast they may move through each other.
        //figure out if this is ever going to be a problem
        this.handleProjectileCollisions()
        this.handleShipCollisions()
        this.ai.makeShipsPlan()
        this.ai.makeShipsMove(elapsedSeconds)
        this.ai.makeShipsFire((s)=>this.handleShipFire(s))
        this.encounterInputHandler.handlePlayerInput(elapsedSeconds, (s)=>this.handleShipFire(s))
        this.updateEncounterResult()
    }

    updateEncounterResult() {
        const {activeEnemyShips, playerFlagship} = this
        if (activeEnemyShips == 0) {
            this.result = ENCOUNTER_RESULTS.Victory
            return
        }
        else if (playerFlagship.escaped) {
            this.result = ENCOUNTER_RESULTS.Escaped
            return
        }
        else if (playerFlagship.isDisabled()) {
            this.result = ENCOUNTER_RESULTS.Defeat
        }
    }

    applyPhysics(elapsedSeconds = 0) {
        const physicsObjects = [...this.activeEnemyShips, ...this.activePlayerShips, ...this.projectiles]
        for (const obj of physicsObjects) {
            obj.x += obj.speedX * elapsedSeconds
            obj.y += obj.speedY * elapsedSeconds
        }
        //gonna make projectiles go faster over time... TODO: figure out if this is actually good/needed
        for (const proj of this.projectiles) {
            proj.speedX *= Math.pow(PROJECTILE_SPEED_INCREASE_FACTOR_PER_SECOND, elapsedSeconds)
            proj.speedY *= Math.pow(PROJECTILE_SPEED_INCREASE_FACTOR_PER_SECOND, elapsedSeconds)
        }
    }

    refreshShipStatus(elapsedSeconds = 0) {
        const {activeShips} = this
        for (const ship of activeShips) {
            ship.rechargeLaser(elapsedSeconds)
            ship.resetCombatVarsTurn() //always last, otherwise recharge ALWAYS works
        }
    }

    handleShipFire(firedBy = new Ship()) {
        const didFire = firedBy.fire()
        if (!didFire) return
        console.log('adding projectile from ship!',firedBy)
        //const {playerShips} = this
        //const isAllied = playerShips.includes(firedBy)
        const color = firedBy.color //isAllied ? 'blue' : 'red'
        const [speedX, speedY] = this.calcProjectileSpeed(firedBy)
        //more lasers = bigger projectile
        const radius = BASE_PROJECTILE_RADIUS_IN_MILES * (1+firedBy.lasers)/10
        const proj = new Projectile(color, radius, firedBy.x, firedBy.y, speedX, speedY, firedBy.angle, firedBy)
        this.projectiles.push(proj)
    }

    calcProjectileSpeed(firedBy = new Ship()) {
        const inertia = Math.max(0, calcSpeedAlongAngle(firedBy.speedX, firedBy.speedY, firedBy.angle))
        const [sx,sy] = rotatePoint(PROJECTILE_SPEED_IN_MILES_PER_SECOND + inertia, 0, 0, 0, firedBy.angle)
        const speed = calcDistance(sx, sy, 0, 0)
        return [sx, sy, speed]
    }

    handleProjectileCollisions() {
        //not allowing friendly fire for now
        //allow shooting at dead ships - doesnt do damage but stops the projectile
        const {projectiles, playerShips, enemyShips} = this
        const projectilesToRemove = []
        projLoop: for (const proj of projectiles) {
            const {x,y,radius,firedBy} = proj
            const opposingShips = playerShips.includes(firedBy) ? enemyShips : playerShips
            for (const target of opposingShips) {
                const colliding = calcCirclesIntersecting(target.x, target.y, target.radius, x, y, radius)
                if (colliding) {
                    this.onProjectileHit(proj, target)
                    projectilesToRemove.push(proj)
                    continue projLoop
                }
            }
        }
        this.projectiles = this.projectiles.filter(p=>(!projectilesToRemove.includes(p)))
    }

    handleObjectsOutOfBounds() {
        const {projectiles, activeShips} = this
        const projectilesToRemove = []
        for (const proj of projectiles) {
            const distFromCenter = calcDistance(proj.x, proj.y, 0, 0)
            //projectiles can travel a bit further than the map edge for cooler visuals
            if (distFromCenter > this.mapDimensions*1.25) {
                projectilesToRemove.push(proj)
            }
        }
        this.projectiles = this.projectiles.filter(p=>(!projectilesToRemove.includes(p)))
        for (const ship of activeShips) {
            const distFromCenter = calcDistance(ship.x, ship.y, 0, 0)
            //projectiles can travel a bit further than the map edge for cooler visuals
            if (distFromCenter > this.mapDimensions) {
                ship.escaped = true
                ship.x = Infinity
                ship.y = Infinity
            }
        }  
    }

    handleShipCollisions() {
        //not allowing friendly fire for now
        let {playerShips, enemyShips} = this
        const ships = [...playerShips, ...enemyShips]
        const liveShips = ships.filter(s=>(!s.isDisabled()))
        //const collided = []
        lsLoop: for (const ls of liveShips) {
            //if (collided.includes(ls)) continue
            const alliedShips = playerShips.includes(ls) ? playerShips : enemyShips
            for (const s of ships) {
                if (ls == s) continue
                const colliding = calcCirclesIntersecting(ls.x, ls.y, ls.radius, s.x, s.y, s.radius)
                if (!colliding) continue
                const noDamage = alliedShips.includes(s) || s.isDisabled()
                this.onShipsCollide(ls, s, noDamage)
                //collided.push(ls)
                continue lsLoop
            }
        }
    }

    onProjectileHit(projectile = new Projectile(), ship = new Ship()) {
        if (ship.isDisabled()) return
        console.log('apply projectile hit!',projectile,ship)
        const {firedBy} = projectile
        const dmg = rng(firedBy.lasers, 1, true)
        ship.takeDamage(dmg)
    }

    onShipsCollide(shipA = new Ship(), shipB = new Ship(), noDamage = false) {
        if (shipA.isDisabled() || shipB.isDisabled()) return
        const dx = shipB.x - shipA.x;
        const dy = shipB.y - shipA.y;

        const distance = Math.hypot(dx, dy);

        // Prevent divide-by-zero
        if (distance === 0) return;

        // Normal vector (unit)
        const nx = dx / distance;
        const ny = dy / distance;

        // Tangent vector
        const tx = -ny;
        const ty = nx;

        // Dot product tangential component
        const dpTanA = shipA.speedX * tx + shipA.speedY * ty;
        const dpTanB = shipB.speedX * tx + shipB.speedY * ty;

        // Dot product normal component
        const dpNormA = shipA.speedX * nx + shipA.speedY * ny;
        const dpNormB = shipB.speedX * nx + shipB.speedY * ny;

        // Using 1D elastic collision formula on the normal axis
        const m1 = shipA.mass ?? 1;
        const m2 = shipB.mass ?? 1;

        const newNormA = (dpNormA * (m1 - m2) + 2 * m2 * dpNormB) / (m1 + m2);
        const newNormB = (dpNormB * (m2 - m1) + 2 * m1 * dpNormA) / (m1 + m2);

        // Convert scalar normal/tangent velocities into vectors
        shipA.speedX = tx * dpTanA + nx * newNormA;
        shipA.speedY = ty * dpTanA + ny * newNormA;

        shipB.speedX = tx * dpTanB + nx * newNormB;
        shipB.speedY = ty * dpTanB + ny * newNormB;

        // Optional: push ships apart so they don't overlap
        const overlap = shipA.radius + shipB.radius - distance;
        if (overlap > 0) {
            const correction = overlap / 2;
            shipA.x -= nx * correction;
            shipA.y -= ny * correction;
            shipB.x += nx * correction;
            shipB.y += ny * correction;
        }

        const massRatio = shipA.mass/shipB.mass

        //slow ships down
        shipA.speedX *= Math.pow(0.9,massRatio);
        shipA.speedY *= Math.pow(0.9,massRatio);
        shipB.speedX *= Math.pow(0.9,1/massRatio);
        shipB.speedY *= Math.pow(0.9,1/massRatio);

        /* damage ships */
        if (!noDamage) {
            const impact = Math.round(Math.abs(dpNormA - dpNormB) / 500);
            shipA.takeDamage(impact)
            shipB.takeDamage(impact)
            console.log('apply ship to ship collision!',{shipA,shipB,dx,dy,distance,nx,ny,tx,ty,dpTanA,dpTanB,m1,m2,newNormA,newNormB,overlap})
        }
    }
}

