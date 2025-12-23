
// Ship class
class Ship {
    constructor(name = "Unnamed", shipType = SHIP_TYPES[0], color = COLORS.White, hull = [0, 0], shields = [0, 0], lasers = 0, engine = 0, cargoSpace = 0, radars = 0, maxActionsPerTurn = SHIP_NUM_MOVES_PER_TURN) {
        this.name = name;
        this.shipType = shipType;
        this.color = [...color];
        this.hull = hull; //sustain more damage before being disabled
        this.shields = shields; //take less damage from lasers
        this.lasers = lasers; //do more damage in combat, and vs. asteroids
        this.radars = radars; //shoot further, and detect enemies and asteroids at greater distances
        this.engine = engine; //move further in combat, travel faster in systems, ram harder, regen shields faster
        this.cargoSpace = cargoSpace; //hold more stuff in your ships
        this.fleet = null;

        //combat vars
        this.x = 0; //used for encounters, only fleets travel in systems
        this.y = 0;
        this.angle = Math.PI*2; //direction ship is facing in. it can only accelerate/decelerate and shoot in that direction
        this.escaped = false;
        this.maxActionsPerTurn = maxActionsPerTurn;
        this.numActionsRemaining = this.maxActionsPerTurn; //for encounter turn processing
        this.aiType = AI_TYPES.Ship
        this.localModules = []
        this.cloakedTurnsRemaining = 0
        this.moduleCooldowns = new CountsMap()
    }

    get modules() {
        return [...this.shipType.modules, ...this.localModules]
    }

    get isFlagship() {
        if (!this.fleet) return false
        return this.fleet.flagship == this
    }

    get radius() {
        //use formula based on mass and radius of a sphere
        return BASE_SHIP_RADIUS_IN_MILES * (1+Math.sqrt(this.mass))
    }

    get mass() {
        return AVERAGE_SHIP_MASS * (this.hull[1]/AVERAGE_SHIP_HULL
        + this.shields[1]/AVERAGE_SHIP_SHIELDS 
        + this.lasers/AVERAGE_SHIP_LASERS
        + this.cargoSpace/AVERAGE_SHIP_CARGO_SPACE
        + this.engine/AVERAGE_SHIP_ENGINE
        + this.radars/AVERAGE_SHIP_RADARS) / 6
    }

    get value() {
        let baseValue = Math.pow(this.mass, 2)*2500
        // Add value of installed modules
        for (const module of this.localModules) {
            if (module && module.moduleType) {
                baseValue += module.moduleType.value * (module.quality || 1)
            }
        }
        return baseValue
    }

    get combatRating() {
        if (this.isDisabled()) return 0
        if (this.escaped) return 0
        const hpRating = 
            this.hull[0] / AVERAGE_SHIP_HULL
            + this.shields[0] / (AVERAGE_SHIP_SHIELDS*2)
            + this.shields[1] / (AVERAGE_SHIP_SHIELDS*2)
        const atkRating = this.lasers / AVERAGE_SHIP_LASERS * this.radars / AVERAGE_SHIP_RADARS + this.engine / AVERAGE_SHIP_ENGINE
        return Math.pow(hpRating * atkRating, 0.5)
    }

    get maxMoveDistance() {
        return 1 + AVERAGE_SHIP_MOVE_DISTANCE * Math.pow( (this.engine/AVERAGE_SHIP_ENGINE) / (this.mass/AVERAGE_SHIP_MASS), 0.5);
    }

    get maxAttackDistance() {
        return 1 + AVERAGE_SHIP_ATTACK_DISTANCE * Math.pow( (this.radars/AVERAGE_SHIP_RADARS) / (this.mass/AVERAGE_SHIP_MASS), 0.5);
    }

    get maxLaserDamage() {
        return 1 + AVERAGE_SHIP_LASER_DMG * (this.lasers/AVERAGE_SHIP_LASERS);
    }

    get maxRamDamage() {
        return 1 + AVERAGE_SHIP_RAM_DMG * Math.pow(this.maxMoveDistance/AVERAGE_SHIP_MOVE_DISTANCE * this.mass/AVERAGE_SHIP_MASS, 0.5);
    }

    isDamaged() {
        return this.hull[0] < this.hull[1]
    }

    repairHull(amt = this.hull[1]) {
        this.hull[0] = Math.min(this.hull[0]+amt, this.hull[1])
    }
    
    restoreShields(amt = this.shields[1]) {
        const beforeShields = this.shields[0]
        this.shields[0] = Math.min(this.shields[0]+amt, this.shields[1])
        const actualRecharge = this.shields[0] - beforeShields
        return actualRecharge
    }

    resetCombatVars() {
        //this.restoreShields() //looks weird visually
        this.angle = Math.PI*2;
        this.escaped = false;
        this.cloakedTurnsRemaining = 0;
        // Set all module cooldowns to max
        for (const moduleType of Object.values(SHIP_MODULES)) {
            this.moduleCooldowns.setAmount(moduleType, moduleType.cooldown)
        }
        this.resetActions()
    }

    resetActions() {
        this.numActionsRemaining = this.maxActionsPerTurn;
        //randomly gain or lose an action sometimes
        if (Math.random() < 0.1) {
            this.numActionsRemaining = this.numActionsRemaining + 1
        }
        if (Math.random() < 0.1) {
            this.numActionsRemaining = Math.max(1, this.numActionsRemaining - 1)
        }
    }

    setDisabled() {
        this.hull[0] = 0
        const recordedAngle = this.angle
        this.resetCombatVars()
        this.angle = recordedAngle
    }

    isDisabled() {
        return this.hull[0] <= 0
    }

    takeDamage(dmg = 0, bypassShields = false) {
        console.log('applying dmg to ship:',this,dmg,bypassShields)
        if (this.isDisabled()) return [0, 0]
        let disabled = false
        let shieldDamage = 0
        let hullDamage = 0
        if (this.shields[0] > 0 && !bypassShields) {
            shieldDamage = Math.min(dmg, this.shields[0])
            this.shields[0] -= shieldDamage
            dmg -= shieldDamage
            if (dmg <= 0) return [hullDamage, shieldDamage]
        }
        hullDamage = Math.min(dmg, this.hull[0])
        this.hull[0] = Math.max(0, this.hull[0] - dmg)
        if (this.hull[0] <= 0) {
            disabled = true
            this.setDisabled()
        }
        return [hullDamage, shieldDamage, disabled]
    }

    rechargeShields() {
        const rechargeAmt = 1 + rng(this.engine/2)
        return this.restoreShields(rechargeAmt)
    }

    calcLaserAreas(overrideX = this.x, overrideY = this.y) {
        const attackRange = 1+this.maxAttackDistance
        const targetingAngle = this.angle+Math.PI/2
        const targetingAngle2 = this.angle-Math.PI/2
        const [tx,ty] = rotatePoint(overrideX + attackRange/2, overrideY, overrideX, overrideY, targetingAngle)
        const [tx2,ty2] = rotatePoint(overrideX + attackRange/2, overrideY, overrideX, overrideY, targetingAngle2)
        //turn the triangles an additional radian so they are pointing outwards
        const targetingTriangle1 = new Triangle(tx, ty, attackRange*2, Triangle.calcEquilateralTriangleHeight(attackRange), targetingAngle+Math.PI)
        const targetingTriangle2 = new Triangle(tx2, ty2, attackRange*2, Triangle.calcEquilateralTriangleHeight(attackRange), targetingAngle2-Math.PI)
        return [targetingTriangle1, targetingTriangle2]
    }

    calcMoveArea(overrideX = this.x, overrideY = this.y) {
        const targetingAngle = this.angle
        const moveRange = 1+this.maxMoveDistance
        //use 0.55, want ship to be forced to move slightly
        const [tx,ty] = rotatePoint(overrideX + moveRange*1.05, overrideY, overrideX, overrideY, targetingAngle)
        //if ship was at 0 angle, it would be facing right. we would want the ellipse to be wider horizontally than vertically
        const ellipse = new Ellipse(tx, ty, moveRange, moveRange*.66, targetingAngle)
        return ellipse
    }

    calcBombArea(overrideX = this.x, overrideY = this.y) {
        const targetingAngle = this.angle
        const attackRange = this.maxAttackDistance/2
        // Position circle slightly in front of ship
        const [cx, cy] = rotatePoint(overrideX + attackRange * 1.2, overrideY, overrideX, overrideY, targetingAngle)
        return new Circle(cx, cy, attackRange)
    }

    calcGravitonBeamArea(overrideX = this.x, overrideY = this.y) {
        const attackRange = 1+this.maxAttackDistance
        const targetingAngle = this.angle
        // Position triangle in front of ship
        const [tx, ty] = rotatePoint(overrideX + attackRange/2, overrideY, overrideX, overrideY, targetingAngle)
        const targetingTriangle = new Triangle(tx, ty, attackRange*2, Triangle.calcEquilateralTriangleHeight(attackRange), targetingAngle+Math.PI)
        return targetingTriangle
    }
}