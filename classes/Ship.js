
// Ship class
class Ship {
    constructor(name = "Unnamed", color = 'white', hull = [0, 0], shields = [0, 0], lasers = 0, thrusters = 0, cargoSpace = 0) {
        this.name = name;
        this.color = color;
        this.hull = hull;
        this.shields = shields;
        this.lasers = lasers;
        this.thrusters = thrusters;
        this.cargoSpace = cargoSpace;
        this.x = 0; //used for encounters, only fleets travel in systems
        this.y = 0;
        this.destinationX = 0;
        this.destinationY = 0;
        this.angle = Math.PI*2; //direction ship is facing in. it can only accelerate/decelerate and shoot in that direction
        this.speedX = 0; //ships have momentum!
        this.speedY = 0;
        this.target = null; //ship that this one's trying to attack
        this.currentLaser = 0;
        this.combatStrategy = COMBAT_STRATEGIES.AttackNearest
        this.autoCombat = true;
        this.manualCombat = false;
        this.laserRechargeProgress = 0;
        this.shieldRechargeProgress = 0;
        this.accelerating = false;
        this.braking = false;
        this.turningLeft = false;
        this.turningRight = false;
        this.beingHit = false;
        this.escaped = false;
        this.radius = BASE_SPACE_SHIP_RADIUS_IN_MILES * (1+this.hull[1]/50)
    }

    get mass() {
        return this.hull[1]/5 + this.shields[1]/5 + this.lasers + this.thrusters + this.cargoSpace
    }

    get value() {
        return Math.pow(this.mass, 2)*10
    }

    isDamaged() {
        this.hull[0] < this.hull[1]
    }

    repairHull(amount = this.hull[1]) {
        this.hull[0] = Math.min(this.hull[0]+amount, this.hull[1])
    }
    
    restoreShields(amount = this.shields[1]) {
        this.shields[0] = Math.min(this.shields[0]+amount, this.shields[1])
    }

    resetCombatVars() {
        this.restoreShields()
        this.destinationX = undefined;
        this.destinationY = undefined;
        this.angle = Math.PI*2;
        this.speedX = 0;
        this.speedY = 0;
        this.target = null;
        this.currentLaser = 0;
        this.combatStrategy = COMBAT_STRATEGIES.AttackNearest
        this.autoCombat = true;
        this.shieldRechargeProgress = 0;
        this.laserRechargeProgress = 0;
        this.escaped = false;
        this.resetCombatVarsTurn()
    }

    resetCombatVarsTurn() {
        //todo: show visuals for these states
        this.accelerating = false;
        this.braking = false;
        this.turningLeft = false;
        this.turningRight = false;
        this.beingHit = false;
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

    //in AU per years. during combat etc. baggage train is left behind.
    calcSpeed() {
        //in SPACE, each thruster makes your fleet go 1 AU per MINUTE if there was no weight
        //in COMBAT, same value = 1,549,263.45  IN  miles per second
        if (this.isDisabled()) return 0
        const mod = 1549263
        let thrusters = this.thrusters * mod * ENCOUNTER_THRUSTER_PENALTY
        return thrusters / this.mass
    }

    calcAngleDeg() {
        return radiansToDegrees(this.angle)
    }

    accelerate(elapsedSeconds = 1, decel = false) {
        if (this.isDisabled()) return
        if (decel) this.braking = true;
        else this.accelerating = true
        const speed = this.calcSpeed() * (decel ? DECELERATION_SPEED_RATIO : 1)
        const force = speed*elapsedSeconds
        const forceDims = rotatePoint(force,0,0,0,this.angle)
        this.speedX += (decel ? -1 : 1) * forceDims[0]
        this.speedY += (decel ? -1 : 1) * forceDims[1]
    }

    turn(elapsedSeconds = 1, counterClockwise = false) {
        if (this.isDisabled()) return
        if (counterClockwise) this.turningLeft = true
        else this.turningRight = true
        const speed = this.calcSpeed()
        const force = speed*elapsedSeconds/TIME_TO_TURN_SHIP_WITH_ONE_THRUSTER_IN_SECONDS
        const turnRatio = force * (counterClockwise ? 1 : -1)
        this.angle += turnRatio*Math.PI*2
    }

    canFire() {
        if (this.isDisabled()) return false
        if (this.laserRechargeProgress < 1) return false
        return true
    }

    fire() {//target = this.target) {
        //if (!this.canFireAt(target)) return false
        if (!this.canFire()) return false
        this.laserRechargeProgress = 0
        return true
        //spawn a projectile
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

    rechargeShields(elapsedSeconds = 1) {
        if (this.isDisabled()) return
        if (this.accelerating || this.braking) return
        if (this.shields[0] >= this.shields[1]) return
        const rechargeProgress = elapsedSeconds/TIME_TO_RECHARGE_SHIELDS_IN_SECONDS * Math.random()
        this.shieldRechargeProgress += rechargeProgress
        const shieldChargedAmt = Math.floor(this.shieldRechargeProgress)
        if (shieldChargedAmt <= 0) return
        this.shieldRechargeProgress -= shieldChargedAmt
        this.shields[0] = Math.max(this.shields[1], this.shields[0]+this.shieldChargedAmt)
    }

    rechargeLaser(elapsedSeconds = 1) {
        if (this.isDisabled()) return
        if (this.laserRechargeProgress >= 1) return
        const rechargeProgress = elapsedSeconds/TIME_TO_RECHARGE_LASER_IN_SECONDS * Math.random()
        this.laserRechargeProgress = Math.min(1, this.laserRechargeProgress+rechargeProgress)
        //console.log('new laser recharge progress:',this.laserRechargeProgress)
    }
}


