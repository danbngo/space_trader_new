/**
 * Represents a mission/quest that the player can accept.
 * @class Mission
 */
class Mission {
    /**
     * @param {MissionType} missionType - The type of mission.
     * @param {Planet} planet - The planet where the mission originates.
     * @param {Planet} [targetPlanet] - The destination planet (if applicable).
     * @param {number} [expirationDate] - When the mission expires (game time).
     * @param {CargoType} [cargoType] - The type of cargo involved (if applicable).
     * @param {number} [amount] - Amount of cargo or credits (if applicable).
     * @param {number} [reward] - The reward for completing the mission.
     */
    constructor(
        missionType = MISSION_TYPES_ALL[0],
        planet = new Planet(),
        targetPlanet = null,
        expirationDate = 0,
        cargoType = null,
        amount = 0,
        reward = 0,
    ) {
        /** @type {string} */
        this.uuid = generateUUID('mission_')
        /** @type {MissionType} */
        this.missionType = missionType;
        /** @type {Planet} */
        this.planet = planet;
        /** @type {Planet|null} */
        this.targetPlanet = targetPlanet;
        /** @type {number} */
        this.expirationDate = expirationDate;
        /** @type {CargoType|null} */
        this.cargoType = cargoType;
        /** @type {number} */
        this.amount = amount;
        /** @type {number} */
        this.reward = reward;

        this.amountFulfilled = 0
        this.succeeded = null;
        this.dateEnded = null;
        
        gameRegistry.registerMission(this)
    }

    get description() {
        return this.missionType.description
    }

    get isExpired() {
        return this.expirationDate > 0 && gs.year > this.expirationDate;
    }

    get value() {
        return this.reward || 1000; // Base value if no reward specified
    }

    /**
     * Check if mission is fulfilled
     * @returns {boolean}
     */
    isFulfilled() {
        return this.amountFulfilled >= this.amount
    }

    /**
     * Check if mission has failed
     * @returns {boolean}
     */
    isFailed() {
        return this.isExpired && !this.isFulfilled()
    }

    /**
     * Update success state based on current progress
     */
    refreshSuccessState() {
        if (this.isFulfilled()) {
            this.succeeded = true
            if (!this.dateEnded) this.dateEnded = gs.year
        } else if (this.isFailed()) {
            this.succeeded = false
            if (!this.dateEnded) this.dateEnded = gs.year
        } else {
            this.succeeded = null
        }
    }

    /**
     * Called when player visits a location (for patrol/survey missions)
     * @param {Planet|SpaceStation} location
     */
    onPlayerVisitLocation(location) {
        if (this.missionType === MISSION_TYPES.PATROL_SECTOR) {
            // Track unique locations visited
            if (!this._visitedLocations) this._visitedLocations = new Set()
            if (!this._visitedLocations.has(location)) {
                this._visitedLocations.add(location)
                this.amountFulfilled = this._visitedLocations.size
            }
        }
        this.refreshSuccessState()
    }

    /**
     * Called when escort reaches destination
     * @param {Fleet} escortFleet
     */
    onPlayerEscortReachDestination(escortFleet) {
        if (this.missionType === MISSION_TYPES.ESCORT_CONVOY) {
            this.amountFulfilled++
        }
        this.refreshSuccessState()
    }

    /**
     * Called when player destroys a ship
     * @param {Ship} ship
     * @param {Fleet} fleet
     */
    onPlayerDestroyShip(ship, fleet) {
        if (this.missionType === MISSION_TYPES.SEEK_AND_DESTROY) {
            // Check if destroyed ship's faction matches mission target
            if (this.missionType.factionTypes.length === 0 || 
                this.missionType.factionTypes.includes(fleet.factionType)) {
                this.amountFulfilled++
            }
        }
        this.refreshSuccessState()
    }

    /**
     * Called when player drops escort
     */
    onPlayerDropEscort() {
        if (this.missionType === MISSION_TYPES.ESCORT_CONVOY) {
            // Failing to escort is mission failure
            this.succeeded = false
            this.dateEnded = gs.year
        }
    }

    /**
     * Called when mission is accepted
     */
    onAcceptMission() {
        // Add mission to active missions
        if (!gs.missions.includes(this)) {
            gs.missions.push(this)
        }

        // For escort missions, spawn the escort fleet
        if (this.missionType === MISSION_TYPES.ESCORT_CONVOY) {
            const escortFactionType = this.missionType.factionTypes.length > 0 
                ? rndMember(this.missionType.factionTypes)
                : FACTION_TYPES.MERCHANTS
            
            // Get the appropriate fleet type for the faction
            const fleetType = escortFactionType.fleetTypes && escortFactionType.fleetTypes.length > 0
                ? rndMember(escortFactionType.fleetTypes)
                : FLEET_TYPES.MERCHANTS
            const escortFleet = generateFleet(fleetType, escortFactionType, this.planet, this.planet)
            
            // Store mission UUID on the fleet (dynamic property for mission tracking)
            /** @type {any} */
            const fleet = escortFleet
            fleet.missionUuid = this.uuid
            
            // Set destination via fleetAI
            if (escortFleet.fleetAI && this.targetPlanet) {
                escortFleet.fleetAI.destination = this.targetPlanet
            }
            
            gs.fleet.escortTarget = escortFleet
            gs.system.fleets.push(escortFleet)
        }

        // For cargo delivery, ensure player has cargo space
        if (this.missionType === MISSION_TYPES.CARGO_DELIVERY && this.cargoType) {
            // TODO: Add cargo to player's fleet when accepted
        }
    }
}
