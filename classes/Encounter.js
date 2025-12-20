

class Encounter {
    constructor(gs = new GameState(), encounterType = ENCOUNTER_TYPES_ALL[0], planet = new Planet(), fleet = new Fleet()) {
        this.encounterType = encounterType;
        this.fleetName = this.encounterType.name
        this.planet = planet;
        this.fleet = fleet;
        this.combatEnabled = false;
        this.mapDimensions = ENCOUNTER_MAP_RADIUS_MILES;
        this.playerFleet = gs.fleet
        this.playerShips = this.playerFleet.ships
        this.playerFlagship = this.playerFleet.flagship
        this.enemyFleet = this.fleet
        this.enemyShips = this.enemyFleet.ships
        this.enemyFlagship = this.enemyFleet.flagship
        this.ships = [...this.playerShips, ...this.enemyShips]
        this.ai = new EncounterAI(this)
        this.result = null //playerVictory, playerDefeat, playerSurrendered,
        this.activeTurnFleet = null
    }

    get disabledPlayerShips () { return this.playerShips.filter(s=>(s.isDisabled())) }
    get escapedPlayerShips () {return this.playerShips.filter(s=>(s.escaped)) }
    get escapedPlayerShips () {return this.playerShips.filter(s=>(s.escaped)) }
    get disabledEnemyShips () {return this.enemyShips.filter(s=>(s.isDisabled())) }
    get activePlayerShips () {return this.playerShips.filter(s=>(!s.isDisabled() && !s.escaped)) }
    get activeEnemyShips () {return this.enemyShips.filter(s=>(!s.isDisabled() && !s.escaped)) }
    get activeShips () {return this.ships.filter(s=>(!s.isDisabled() && !s.escaped)) }
    //get ships() { return [...this.playerShips, ...this.enemyShips] } //dont use. static.

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
}

