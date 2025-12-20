
// Ship class
class Ship {
    constructor(name = "Unnamed", shipType = SHIP_TYPES[0], color = COLORS.White, hull = [0, 0], shields = [0, 0], lasers = 0, thrusters = 0, cargoSpace = 0, radars = 0) {
        this.name = name;
        this.shipType = shipType;
        this.color = color;
        this.hull = hull;
        this.shields = shields;
        this.lasers = lasers;
        this.radars = radars;
        this.thrusters = thrusters;
        this.cargoSpace = cargoSpace;
        this.fleet = null;

        //combat vars
        this.x = 0; //used for encounters, only fleets travel in systems
        this.y = 0;
        this.angle = Math.PI*2; //direction ship is facing in. it can only accelerate/decelerate and shoot in that direction
        this.escaped = false;
        this.numActionsRemaining = SHIP_NUM_ACTIONS_PER_TURN; //for encounter turn processing
    }

    get isFlagship() {
        if (!this.fleet) return false
        return this.fleet.flagship == this
    }

    get radius() {
        //use formula based on mass and radius of a sphere
        return BASE_SPACE_SHIP_RADIUS_IN_MILES * (1+Math.cbrt(this.mass))
    }

    get mass() {
        return this.hull[1]/AVERAGE_SHIP_HULL
        + this.shields[1]/AVERAGE_SHIP_SHIELDS 
        + this.lasers/AVERAGE_SHIP_LASERS
        + this.cargoSpace/AVERAGE_SHIP_CARGO_SPACE
        + this.thrusters/AVERAGE_SHIP_THRUSTERS
        + this.radars/AVERAGE_SHIP_RADARS
    }

    get value() {
        return Math.pow(this.mass, 2)*10
    }

    get combatRating() {
        if (this.isDisabled()) return 0
        if (this.escaped) return 0
        const hpRating = 
            this.hull[0] / AVERAGE_SHIP_HULL
            + this.shields[0] / (AVERAGE_SHIP_SHIELDS*2)
            + this.shields[1] / (AVERAGE_SHIP_SHIELDS*2)
        const atkRating = this.lasers / AVERAGE_SHIP_LASERS * this.radars / AVERAGE_SHIP_RADARS
        return hpRating * atkRating
    }

    get maxMoveDistance() {
        return this.thrusters * 2;
    }

    get maxSensorDistance() {
        return this.radars * 4;
    }

    get maxLaserDamage() {
        return this.lasers;
    }

    isDamaged() {
        return this.hull[0] < this.hull[1]
    }

    repairHull(amt = this.hull[1]) {
        this.hull[0] = Math.min(this.hull[0]+amt, this.hull[1])
    }
    
    restoreShields(amt = this.shields[1]) {
        this.shields[0] = Math.min(this.shields[0]+amt, this.shields[1])
    }

    resetCombatVars() {
        //this.restoreShields() //looks weird visually
        this.angle = Math.PI*2;
        this.shieldRechargeProgress = 0;
        this.laserRechargeProgress = 0;
        this.escaped = false;
        this.numActionsRemaining = SHIP_NUM_ACTIONS_PER_TURN
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

    takeDamage(dmg = 0) {
        console.log('applying dmg to ship:',this,dmg)
        if (this.isDisabled()) return
        this.beingHit = true
        if (this.shields[0] > 0) {
            this.shields[0] = Math.max(0, this.shields[0] - dmg)
            return
        }
        this.hull[0] = Math.max(0, this.hull[0] - dmg)
        if (this.hull[0] <= 0) this.setDisabled()
    }

}


