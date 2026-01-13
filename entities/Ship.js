
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
     * @param {number} fuelCapacity - The fuel capacity of the ship.
     * @param {number} lasers - The laser power of the ship.
     * @param {number} engine - The engine power of the ship.
     * @param {number} cargoSpace - The cargo space available on the ship.
     * @param {number} radars - The radar capability of the ship.
     */
    constructor(name = "Unnamed", shipType = SHIP_TYPES[0], color = COLORS.White, hull = [0, 0], shields = [0, 0], lasers = 0, engine = 0, cargoSpace = 0, radars = 0, fuelCapacity = 0) {
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
        this.fuelCapacity = fuelCapacity; //maximum fuel capacity
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
        /** @type {number} - Visual row position (0=middle, positive=up, negative=down) */
        this.rowIndex = 0;
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
        
        // Temporary properties used during deserialization (SaveManager)
        /** @type {string} */
        this._fleetUUID = undefined;
        /** @type {string} */
        this._pilotUUID = undefined;
        /** @type {string} */
        this._disabledByShipUUID = undefined;
        /** @type {string} */
        this._aiTypeName = undefined;

        this.actionsRemaining = 1
        this.acting = false
        
        gameRegistry.registerShip(this)
    }

    get quality() {
        console.log('getting quality:',this,this.shipType)
        let totalStats = this.lasers + this.hull[1] + this.shields[1] + this.engine + this.cargoSpace + this.radars
        let expectedStats = this.shipType.lasers * AVERAGE_SHIP_LASERS + this.shipType.hull * AVERAGE_SHIP_HULL + this.shipType.shields * AVERAGE_SHIP_SHIELDS + this.shipType.engine * AVERAGE_SHIP_ENGINE + this.shipType.cargoSpace * AVERAGE_SHIP_CARGO_SPACE + this.shipType.radars * AVERAGE_SHIP_RADARS  
        return totalStats / expectedStats
    }

    get modules() {
        return [...this.shipType.modules, ...this.localModules]
    }

    get moduleTypes() {
        return this.modules.map(m => m.moduleType)
    }
    
    get unusedModuleSlots() {
        const totalSlots = this.shipType.moduleSlots || 0
        const usedSlots = this.localModules.length
        return Math.max(0, totalSlots - usedSlots)
    }
    
    /**
     * Get the quality of a specific module installed on this ship
     * @param {ShipModuleType} moduleType
     * @returns {number} Quality multiplier (default 1.0)
     */
    getModuleQuality(moduleType) {
        const module = this.modules.find(m => m.moduleType === moduleType)
        return module ? (module.quality || 1.0) : 1.0
    }

    get isFlagship() {
        if (!this.fleet) return false
        return this.fleet.flagship == this
    }

    get radius() {
        return BASE_SHIP_RADIUS_IN_MILES * (1+Math.sqrt(this.mass))
    }

    get mass() {
        return 1 * AVERAGE_SHIP_MASS
        * (this.hull[1]/AVERAGE_SHIP_HULL
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
     * Resets all travel-related variables to initial state.
     */
    resetCombatVars() {
        this.actionsRemaining = 1;
        this.escaped = false;
    }

    /**
     * Sets the ship to disabled state (hull = 0).
     */
    setDisabled() {
        this.hull[0] = 0
        this.resetCombatVars()
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
        // REMOVED: STATUS_EFFECTS
        this.statusEffects.setAmount('CLOAKED', 0)
        
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
     * Creates an HTML image element showing this ship's graphical representation.
     * @param {number} size - The size in pixels for the ship image.
     * @param {number[]} [color] - Optional color override (defaults to ship's fleet color or ship color).
     * @returns {HTMLCanvasElement} Canvas element showing the ship.
     */
    asCanvas(size = 80, color = COLORS.White) {
        console.log('drawing ship as canvas:', this.name, size, color)
        // Determine the color to use
        const shipColor = color || (this.fleet ? this.fleet.color : this.color);
        
        // Get the ship shape from the ship type
        const shipShape = this.shipType?.shipShape || SHIP_SHAPES.COURIER;
        
        // Convert to CanvasObject instances
        const polygons = shipShape.toPolygons(shipColor, size);
        
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = size * 2;
        canvas.height = size * 2;
        const ctx = canvas.getContext('2d');
        
        // Sort polygons by zIndex to ensure proper layering (lower zIndex draws first)
        polygons.sort((a, b) => a.zIndex - b.zIndex);
        
        // Use CanvasObject.draw() to render each polygon
        for (const polygon of polygons) {
            polygon.draw(Date.now(), ctx, size, size, size, 0, 0);
        }
        
        return canvas;
    }
}