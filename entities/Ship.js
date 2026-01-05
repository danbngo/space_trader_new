
/**
 * Represents a spaceship with various attributes and methods for combat and movement.
 * @class Ship
 */
class Ship {
    /**
     * @param {string} name - The name of the ship.
     * @param {ShipType} shipType - The type of the ship, containing its modules and other characteristics.
     * @param {number[]} color - The RGB color of the ship.
     * @param {number[]} hull - The current and maximum hull integrity [current, max].
     * @param {number[]} shields - The current and maximum shield strength [current, max].
     * @param {number} lasers - The laser power of the ship.
     * @param {number} engine - The engine power of the ship.
     * @param {number} cargoSpace - The cargo space available on the ship.
     * @param {number} radars - The radar capability of the ship.
     * @param {number} maxActionsPerTurn - The maximum number of actions the ship can take per turn.
     */
    constructor(name = "Unnamed", shipType = SHIP_TYPES[0], color = COLORS.White, hull = [0, 0], shields = [0, 0], lasers = 0, engine = 0, cargoSpace = 0, radars = 0, maxActionsPerTurn = SHIP_NUM_MOVES_PER_TURN) {
        /** @type {string} */
        this.name = name;
        /** @type {ShipType} */
        this.shipType = shipType;
        /** @type {number[]} */
        this.color = [...color];
        /** @type {number[]} */
        this.hull = hull; //sustain more damage before being disabled
        /** @type {number[]} */
        this.shields = shields; //take less damage from lasers
        /** @type {number} */
        this.lasers = lasers; //do more damage in combat, and vs. asteroids
        /** @type {number} */
        this.radars = radars; //shoot further, and detect enemies and asteroids at greater distances
        /** @type {number} */
        this.engine = engine; //move further in combat, travel faster in systems, ram harder, regen shields faster
        /** @type {number} */
        this.cargoSpace = cargoSpace; //hold more stuff in your ships
        /** @type {Fleet} */
        this.fleet = null;
        /** @type {Officer|null} */
        this.pilot = null;

        //combat vars
        /** @type {number} */
        this.x = 0; //used for encounters, only fleets travel in systems
        /** @type {number} */
        this.y = 0;
        /** @type {number} */
        this.angle = Math.PI*2; //direction ship is facing in. it can only accelerate/decelerate and shoot in that direction
        /** @type {boolean} */
        this.escaped = false;
        /** @type {number} */
        this.maxActionsPerTurn = maxActionsPerTurn;
        /** @type {number} */
        this.actionsRemaining = this.maxActionsPerTurn; //for encounter turn processing
        /** @type {AI_TYPES} */
        this.aiType = null
        /** @type {ShipModule[]} */
        this.localModules = []
        /** @type {CountsMap} */
        this.moduleCooldowns = new CountsMap()
        /** @type {CountsMap} */
        this.statusEffects = new CountsMap()
        /** @type {Ship} */
        this.disabledByShip = null

        /** @type {string} */
        this.uuid = generateUUID('ship_');
        /** @type {number} */
        this.radiusModifier = 1;
        /** @type {number} */
        this.widthModifier = 1;
    }

    get quality() {
        let totalStats = this.lasers + this.hull[1] + this.shields[1] + this.engine + this.cargoSpace + this.radars
        let expectedStats = this.shipType.lasers * AVERAGE_SHIP_LASERS + this.shipType.hull * AVERAGE_SHIP_HULL + this.shipType.shields * AVERAGE_SHIP_SHIELDS + this.shipType.engine * AVERAGE_SHIP_ENGINE + this.shipType.cargoSpace * AVERAGE_SHIP_CARGO_SPACE + this.shipType.radars * AVERAGE_SHIP_RADARS  
        console.log('getting quality:',totalStats, expectedStats, totalStats / expectedStats)
        return totalStats / expectedStats
    }

    get modules() {
        return [...this.shipType.modules, ...this.localModules]
    }

    get moduleTypes() {
        return this.modules.map(m => m.moduleType)
    }

    get isFlagship() {
        if (!this.fleet) return false
        return this.fleet.flagship == this
    }

    get radius() {
        //use formula based on mass and radius of a sphere
        return BASE_SHIP_RADIUS_IN_MILES * (1+Math.sqrt(this.mass)) * this.radiusModifier
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
        if (this.disabled) return 0
        if (this.escaped) return 0
        const hpRating = 
            this.hull[0] / AVERAGE_SHIP_HULL
            + this.shields[0] / (AVERAGE_SHIP_SHIELDS*2)
            + this.shields[1] / (AVERAGE_SHIP_SHIELDS*2)
        const atkRating = this.lasers / AVERAGE_SHIP_LASERS * this.radars / AVERAGE_SHIP_RADARS + this.engine / AVERAGE_SHIP_ENGINE
        return Math.pow(hpRating * atkRating, 0.5)
    }

    get maxMoveDistance() {
        const baseDistance = (1 + AVERAGE_SHIP_MOVE_DISTANCE * Math.pow( (this.engine/AVERAGE_SHIP_ENGINE) / (this.mass/AVERAGE_SHIP_MASS), 0.5));
        
        // Apply Pilot skill (2x movement at 50 skill)
        const pilotSkill = this.fleet.totalSkills.getAmount(SKILLS.Pilot)
        const pilotModifier = 1 + (pilotSkill / 50)
        
        // Apply movement penalty if ship is frozen
        if (this.statusEffects.has(STATUS_EFFECTS.FROZEN)) {
            return baseDistance * pilotModifier * 0.5;
        }
        return baseDistance * pilotModifier;
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

    /**
     * Checks if the ship's hull is damaged.
     * @returns {boolean} True if hull is below maximum.
     */
    isDamaged() {
        return this.hull[0] < this.hull[1]
    }

    /**
     * Repairs the ship's hull.
     * @param {number} amt - Amount of hull to repair (defaults to full repair).
     */
    repairHull(amt = this.hull[1]) {
        this.hull[0] = Math.min(this.hull[0]+amt, this.hull[1])
    }
    
    /**
     * Restores the ship's shields.
     * @param {number} amt - Amount of shields to restore (defaults to full restore).
     * @returns {number} The actual amount of shields restored.
     */
    restoreShields(amt = this.shields[1]) {
        if (this.shields[0] >= this.shields[1]) return 0
        const beforeShields = this.shields[0]
        this.shields[0] = Math.min(this.shields[0]+amt, this.shields[1])
        const actualRecharge = this.shields[0] - beforeShields
        return actualRecharge
    }

    /**
     * Rotates the ship by adding to its current angle.
     * @param {number} delta - The angle to add (in radians).
     * @returns {number} The new normalized angle.
     */
    incrementAngle(delta = 0) {
        this.angle += delta
        // Normalize to 0 to 2π range
        this.angle = this.angle % (Math.PI * 2)
        if (this.angle < 0) {
            this.angle += Math.PI * 2
        }
        return this.angle
    }

    /**
     * Resets all combat-related variables to initial state.
     */
    resetCombatVars() {
        //this.restoreShields() //looks weird visually
        this.angle = Math.PI*2;
        this.escaped = false;
        // Set all module cooldowns to max
        for (const moduleType of Object.values(SHIP_MODULE_TYPES)) {
            this.moduleCooldowns.setAmount(moduleType, rng(moduleType.cooldown, 0, true))
        }
        this.statusEffects.clear()
        this.resetActions()
    }

    /**
     * Resets action points at the start of a new turn.
     */
    resetActions() {
        this.actionsRemaining = this.maxActionsPerTurn;
        
        // Check for SpeedModule - grants +1 action per turn
        const speedModule = this.modules.find(m => m.moduleType === SHIP_MODULE_TYPES.SPEED_MODULE)
        if (speedModule && Math.random() > .8) {
            this.actionsRemaining = this.actionsRemaining + 1
        }
        // Commented out random slow - kept for reference
        // if (Math.random() < 0.1) {
        //     this.actionsRemaining = Math.max(1, this.actionsRemaining - 1)
        // }
    }

    /**
     * Consumes one action point.
     * @returns {Array} Array of pseudo-actions (currently empty).
     */
    spendAction() {
        const pseudoActions = []
        this.actionsRemaining = Math.max(0, this.actionsRemaining - 1)
        
        //we could later add dot damage here

        return pseudoActions
    }

    /**
     * Sets the ship to disabled state (hull = 0).
     */
    setDisabled() {
        this.hull[0] = 0
        const recordedAngle = this.angle
        this.resetCombatVars()
        this.angle = recordedAngle
    }

    get disabled() {
        return this.hull[0] <= 0
    }

    /**
     * Applies damage to the ship, reducing shields first then hull.
     * @param {number} dmg - The amount of damage to apply.
     * @param {boolean} bypassShields - Whether to ignore shields.
     * @param {boolean} dontHurtHull - Whether to prevent hull damage.
     * @param {Ship} sourceShip - The ship that caused the damage.
     * @returns {[number, number, boolean]} [hullDamage, shieldDamage, disabled]
     */
    takeDamage(dmg = 0, bypassShields = false, dontHurtHull = false, sourceShip = null) {
        if (this.disabled) return [0, 0, false]
        
        // Clear cloak status when taking damage
        this.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 0)
        
        let disabled = false
        let shieldDamage = 0
        let hullDamage = 0
        if (this.shields[0] > 0 && !bypassShields) {
            shieldDamage = Math.min(dmg, this.shields[0])
            this.shields[0] -= shieldDamage
            dmg -= shieldDamage
            if (dmg <= 0) return [hullDamage, shieldDamage, disabled]
        }
        if (!dontHurtHull) {
            hullDamage = Math.min(dmg, this.hull[0])
            this.hull[0] = Math.max(0, this.hull[0] - dmg)
            if (this.hull[0] <= 0) {
                disabled = true
                this.disabledByShip = sourceShip
                this.setDisabled()
            }
        }
        return [hullDamage, shieldDamage, disabled]
    }

    /**
     * Recharges shields based on engine power.
     * @returns {number} The amount of shields recharged.
     */
    rechargeShields() {
        const rechargeAmt = 1 + rng(this.engine/2)
        return this.restoreShields(rechargeAmt)
    }

    /**
     * Calculates the attack areas for laser weapons (two triangles).
     * @param {number} overrideX - Override x position (defaults to ship.x).
     * @param {number} overrideY - Override y position (defaults to ship.y).
     * @returns {Triangle[]} Array of two targeting triangles.
     */
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

    /**
     * Calculates the movement area for this ship (ellipse).
     * @param {number} overrideX - Override x position (defaults to ship.x).
     * @param {number} overrideY - Override y position (defaults to ship.y).
     * @returns {Ellipse} The movement area.
     */
    calcMoveArea(overrideX = this.x, overrideY = this.y) {
        const targetingAngle = this.angle
        const moveRange = 1+this.maxMoveDistance
        //use 0.55, want ship to be forced to move slightly
        const [tx,ty] = rotatePoint(overrideX + moveRange*1.05, overrideY, overrideX, overrideY, targetingAngle)
        //if ship was at 0 angle, it would be facing right. we would want the ellipse to be wider horizontally than vertically
        const ellipse = new Ellipse(tx, ty, moveRange, moveRange*.66, targetingAngle)
        return ellipse
    }

    /**
     * Calculates the bomb/warhead area (circle in front of ship).
     * @param {number} overrideX - Override x position (defaults to ship.x).
     * @param {number} overrideY - Override y position (defaults to ship.y).
     * @returns {Circle} The bomb area.
     */
    calcBombArea(overrideX = this.x, overrideY = this.y) {
        const targetingAngle = this.angle
        const attackRange = this.maxAttackDistance/2
        // Position circle slightly in front of ship
        const [cx, cy] = rotatePoint(overrideX + attackRange * 1.2, overrideY, overrideX, overrideY, targetingAngle)
        return new Circle(cx, cy, attackRange)
    }

    /**
     * Calculates the beam weapon area (triangle in front of ship).
     * @param {number} overrideX - Override x position (defaults to ship.x).
     * @param {number} overrideY - Override y position (defaults to ship.y).
     * @returns {Triangle} The beam area.
     */
    calcBeamArea(overrideX = this.x, overrideY = this.y) {
        const attackRange = 1+this.maxAttackDistance
        const targetingAngle = this.angle
        // Position triangle in front of ship
        const [tx, ty] = rotatePoint(overrideX + attackRange/2, overrideY, overrideX, overrideY, targetingAngle)
        const targetingTriangle = new Triangle(tx, ty, attackRange*2, Triangle.calcEquilateralTriangleHeight(attackRange), targetingAngle+Math.PI)
        return targetingTriangle
    }

    /**
     * Calculates the EMP pulse area (circle centered on ship).
     * @param {number} overrideX - Override x position (defaults to ship.x).
     * @param {number} overrideY - Override y position (defaults to ship.y).
     * @returns {Circle} The pulse area.
     */
    calcPulseArea(overrideX = this.x, overrideY = this.y) {
        // EMP pulse is centered on the ship and has radius = maxAttackDistance * 2
        const pulseRadius = this.maxAttackDistance/2
        return new Circle(overrideX, overrideY, pulseRadius)
    }

    get canShoot() {
        return this.lasers > 0 && !this.disabled && !this.escaped
    }

    get canUseModules() {
        return !this.disabled && !this.escaped && !this.statusEffects.has(STATUS_EFFECTS.OVERHEATED)
    }

    get canRam() {
        return this.engine > 0 && !this.disabled && !this.escaped && !this.statusEffects.has(STATUS_EFFECTS.FROZEN)
    }

    get canRecharge() {
        return !this.disabled && !this.escaped && !this.statusEffects.has(STATUS_EFFECTS.IONIZED) && (this.shields[0] < this.shields[1])
    }

    get moduleSlots() {
        const available = this.shipType.moduleSlots
        const used = this.localModules.length
        return [used, available]
    }

    get unusedModuleSlots() {
        const [used, available] = this.moduleSlots
        return available-used
    }
}