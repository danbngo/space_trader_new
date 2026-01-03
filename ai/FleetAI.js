/**
 * Base class for AI that controls NPC fleet behavior in the solar system.
 * @class FleetAI
 */
class FleetAI {
    /**
     * @param {Fleet} fleet - The fleet controlled by this AI.
     * @param {SpaceObject} origin - The planet this fleet originated from.
     * @param {StarMap} starMap - Optional reference to the StarMap for displaying popups.
     */
    constructor(fleet = null, origin = null, starMap = null) {
        /** @type {Fleet} */
        this.fleet = fleet;
        /** @type {SpaceObject} */
        this.origin = origin;
        /** @type {StarMap|null} */
        this.starMap = starMap;
        /** @type {SpaceObject} */
        this.destination = this.calcDestination();
        /** @type {any} */
        this.target = null
        this.voyageYearsRemaining = Infinity
        /** @type {SpaceObject[]} */
        this.visited = []
        this.resetVoyageDuration()
        if (!Number.isFinite(this.voyageYearsRemaining)) throw new Error('fleetAI must have a finite voyage duration!!')
        //console.log('created fleet AI with props:', {fleet: this.fleet, home: this.home, destination: this.destination, voyageYearsRemaining: this.voyageYearsRemaining})
        if (!this.destination) {
            console.log('Warning: Could not find a valid destination for fleet type, going to remove it immediately')
            this.origin = null
            this.destination = null
            this.target = null
            this.voyageYearsRemaining - -Infinity
            gs.system.removeFleet(this.fleet)
        }
    }

    addPopup(text = '', color = COLORS.WHITE, overrideX = this.fleet.x, overrideY = this.fleet.y) {
        if (!this.starMap) return
        this.starMap.addPopup(overrideX, overrideY, text, color)
    }
    /**
     * Updates AI behavior each game tick.
     */
    tick(elapsedYears = 1) {
        this.voyageYearsRemaining -= elapsedYears;
        if (this.isNearOrigin(elapsedYears)) {
            this.onNearOrigin()
            return
        }
        else if (this.isNearDestination(elapsedYears)) {
            this.onNearDestination();
            return
        }
        else if (this.isNearTarget(elapsedYears)) {
            this.onNearTarget();
            return
        }
        else if (this.voyageYearsRemaining > 0) {
            //ships that pursue other ships will continuously check for closer targets
            if (!this.target || Number.isFinite(this.fleet.fleetType.targetMaxDistance)) { 
                if (Math.random() < .9) return
                const validTargets = this.calcValidTargets()
                const target = this.findNearest(validTargets, this.fleet.fleetType.targetMaxDistance || Infinity);
                if (target && target !== this.target) {
                    // Show interest popup when finding a new target
                    const canTarget = this.setTarget(target);
                    console.log(`🔍 ${this.fleet.name} ${this.fleet.uuid} found new target: ${target.name} ${target.uuid} and could target:`, canTarget)
                    if (!canTarget) {
                        this.visited.push(target) //give up if we cant reach the target
                    }
                    else this.addPopup('!', COLORS.DarkYellow)
                    return
                }
            }
        }
        if (!this.fleet.route) {
            this.resumeVoyage()
        }
        else {
           //was some route refresh logic here but it was causing problems
        }
        if (this.fleet.factionType.cloaked) {
            this.fleet.cloakLevel = Math.min(1.0, this.fleet.cloakLevel + (0.01 * elapsedYears));
        }
    }
    /** @returns {Fleet[]|SpaceObject[]} */
    calcValidTargets() {        
        //override in subclasses
        return []
    }
    /** @returns {SpaceObject|null} */
    calcDestination() {
        return rndMember(gs.system.planets.filter(p=>(p !== this.origin)))
    }

    resetVoyageDuration() {
        this.voyageYearsRemaining = this.fleet.fleetType.voyageYears;
    }

    setTarget(target) {
        const route = new Route(this.fleet, target)
        if (route.valid) {
            this.route = route
            this.target = target
            return true
        }
        return false
    }

    /**
     * Checks if fleet has arrived at destination.
     * @returns {boolean}
     */
    isNearDestination(elapsedYears = 1) {
        return this.destination && this.isNearby(this.destination, elapsedYears)
    }

    isNearOrigin(elapsedYears = 1) {
        return this.isNearby(this.origin, elapsedYears) && !this.destination
    }

    isNearTarget(elapsedYears = 1) {
        return this.target && this.isNearby(this.target, elapsedYears)
    }

    isNearby(object = new SpaceObject(), elapsedYears = 1) {
        const distMod = elapsedYears/MAX_FRAMES_PER_SECOND/STAR_MAP_YEARS_PER_MS //during simus make ships able to collide easier
        return calcDistance(this.fleet.x, this.fleet.y, object.x, object.y) < (FLEET_COLLISION_DISTANCE*distMod) // Within 0.01 AU
    }

    resumeVoyage() {
        if (Math.random() < .9) return; //ships will "hang out" for a while before moving on
        console.log('▶', `${this.fleet.name+' '+this.fleet.uuid} is resuming its voyage.`)
        this.target = null
        if (this.destination && this.fleet.location != this.destination) this.fleet.route = new Route(this.fleet, this.destination)
        else if (this.origin && this.fleet.location != this.origin) this.fleet.route = new Route(this.fleet, this.origin)
    }

    /**
     * Called when fleet arrives at destination.
     */
    onNearOrigin() {
        console.log('🏠', `${this.fleet.name+' '+this.fleet.uuid} has returned home to ${this.origin.name+' '+this.origin.uuid}.`)
        this.route = null
        this.destination = null
        gs.system.removeFleet(this.fleet)
    }

    onNearDestination() {
        console.log('🛬', `${this.fleet.name+' '+this.fleet.uuid} has arrived at destination ${this.destination.name+' '+this.destination.uuid}.`)
        this.destination = null
        this.route = null
        this.resetVoyageDuration()
    }

    onNearTarget() {
        //override in subclass
    }

    fightTarget(andLoot = false) {
        if (!this.target || !(this.target instanceof Fleet) || !this.target.fleetAI) {
            console.log(this,this.target,this.fleet)
            throw new Error('FleetAI.fightTarget called with invalid target!');
        }
        console.log('⚔️', `${this.fleet.name+' '+this.fleet.uuid} is engaging ${this.target.name+' '+this.target.uuid}!`)
        
    // Show popup if starMap is available
        this.addPopup('⚔️', COLORS.Red)
        this.addPopup('⚔️', COLORS.Red, this.target.x, this.target.y)
        
        // Reveal both fleets during combat
        this.fleet.cloakLevel = 0
        this.target.cloakLevel = 0
        //chance to win is based on our fleet combat scores
        const ourScore = this.fleet.combatRating
        const theirScore = this.target.combatRating
        const totalScore = ourScore + theirScore
        const roll = rng(totalScore, 1)
        const loser = (roll <= ourScore) ? this.target : this.fleet
        const winner = (roll <= ourScore) ? this.fleet : this.target
        const winnerScore = (roll <= ourScore) ? ourScore : theirScore
        const loserScore = (roll <= ourScore) ? theirScore : ourScore

        const strengthRatio = (loserScore / winnerScore) / (winnerScore+loserScore) // How strong they were relative to us
        // Apply damage to both sides
        for (const ship of winner.ships) {
            const damage = rng(ship.hull[1]*strengthRatio)
            ship.takeDamage(damage,true)
        }
        for (const ship of loser.ships) {
            const damage = rng(ship.hull[1]*1/strengthRatio)
            ship.takeDamage(damage,true)
        }
        
        // Check if loser still has any active ships after damage
        const loserHasActiveShips = loser.ships.some(ship => ship.hull[0] > 0)
        
        // 30% chance for loser to flee if they still have active ships
        if (loserHasActiveShips && Math.random() < 0.3) {
            // Loser flees - no loot, both sides took damage
            console.log('💨', `${loser.name+' '+loser.uuid} has fled from ${winner.name+' '+winner.uuid}!`)
            this.addPopup('💨', COLORS.Yellow, loser.x, loser.y)
            
            // Clear targets and routes for both fleets
            loser.fleetAI.target = null
            loser.fleetAI.route = null
            winner.fleetAI.target = null
            winner.fleetAI.route = null
            
            return winner
        }
        
        // Loser is destroyed
        this.addPopup('💀', COLORS.Red, loser.x, loser.y)

        loser.fleetAI.onDestroyed()
        winner.fleetAI.target = null
        winner.fleetAI.route = null
        console.log('🏆', `${winner.name+' '+winner.uuid} has defeated ${loser.name+' '+loser.uuid} in combat!`)

        if (andLoot) {
            // Winner takes cargo from loser
            winner.fleetAI.transferCargo(loser, winner)
            winner.fleetAI.transferCredits(loser, winner)
        }

        return winner
    }

    onDestroyed() {
        gs.system.removeFleet(this.fleet)
    }

    /**
     * Transfer cargo from one fleet to another (up to available space)
     * @param {Fleet} fromFleet - Fleet to take cargo from
     * @param {Fleet} toFleet - Fleet to transfer cargo to
     */
    transferCargo(fromFleet, toFleet) {
        console.log(`💰 ${toFleet.name+' '+toFleet.uuid} seizing of cargo from ${fromFleet.name+' '+fromFleet.uuid}`);
        if (!fromFleet.cargo || fromFleet.cargo.total === 0) return;
        
        const availableSpace = toFleet.availableCargoSpace;
        if (availableSpace <= 0) return;
        
        // Transfer cargo up to available space
        const cargoTypes = fromFleet.cargo.counts.keys();
        let transferred = 0;
        
        for (const cargoType of cargoTypes) {
            if (transferred >= availableSpace) break;
            
            const amount = fromFleet.cargo.getAmount(cargoType);
            const toTransfer = Math.min(amount, availableSpace - transferred);
            
            fromFleet.cargo.increment(cargoType, -toTransfer);
            toFleet.cargo.increment(cargoType, toTransfer);
            transferred += toTransfer;
        }
        
        if (transferred > 0) {
            
            // Show theft popup at the location where cargo is being taken
            this.addPopup('💰', COLORS.LightYellow, toFleet.x, toFleet.y)
            //show another popup to show that target is LOSING money
            this.addPopup('💸', COLORS.DarkYellow, fromFleet.x, fromFleet.y)
        }
    }

    /**
     * Transfer credits from one fleet's captain to another
     * @param {Fleet} fromFleet - Fleet to take credits from
     * @param {Fleet} toFleet - Fleet to transfer credits to
     */
    transferCredits(fromFleet, toFleet) {
        if (!fromFleet.captain || !toFleet.captain) return;
        
        const creditsToTake = fromFleet.captain.credits;
        if (creditsToTake <= 0) return;
        
        fromFleet.captain.credits = 0;
        toFleet.captain.credits += creditsToTake;
        
        console.log(`💵 ${toFleet.name+' '+toFleet.uuid} took ${creditsToTake} credits from ${fromFleet.name+' '+fromFleet.uuid}`);
        
        // Show credits transfer popup
        this.addPopup('💵', COLORS.Green, toFleet.x, toFleet.y)
        this.addPopup('💸', COLORS.DarkYellow, fromFleet.x, fromFleet.y)
    }

    /**
     * Transfer officers (excluding captain) from one fleet to another
     * @param {Fleet} fromFleet - Fleet to take officers from
     * @param {Fleet} toFleet - Fleet to transfer officers to
     */
    transferOfficers(fromFleet, toFleet) {
        if (!fromFleet.captain || !toFleet.captain) return;
        
        const officersToTake = fromFleet.officers.slice(); // Copy array
        if (officersToTake.length === 0) return;
        
        // Remove all subordinates from source fleet
        for (const officer of officersToTake) {
            fromFleet.removeOfficer(officer);
            toFleet.officers.push(officer); //no need.
        }
        
        console.log(`👥 ${toFleet.name+' '+toFleet.uuid} captured ${officersToTake.length} officers from ${fromFleet.name+' '+fromFleet.uuid}`);
        
        // Show crew capture popup
            this.addPopup('👥', COLORS.Orange, toFleet.x, toFleet.y)
            this.addPopup('💔', COLORS.DarkRed, fromFleet.x, fromFleet.y)
    }
    /**
     * Finds nearest object of a given type.
     * @param {SpaceObject[]} objects - Array of space objects to search.
     * @param {number} maxDistance - Maximum distance in AU.
     * @returns {SpaceObject|null}
     */
    findNearest(objects = [], maxDistance = Infinity) {
        if (!this.fleet || objects.length == 0) return null;
        
        let nearest = null;
        let nearestDist = maxDistance;
        
        for (const obj of objects) {
            const dx = obj.x - this.fleet.x;
            const dy = obj.y - this.fleet.y;
            const dist = Math.sqrt(dx * dx + dy * dy) * (obj instanceof Fleet ? 1-obj.cloakLevel : 1);
            
            if (dist < nearestDist) {
                nearest = obj;
                nearestDist = dist;
            }
        }
        return nearest;
    }
}
