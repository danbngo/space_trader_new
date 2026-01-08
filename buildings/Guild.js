/**
 * A building where officers can be hired.
 * @class Guild
 * @extends {Building}
 */
class Guild extends Building {
    /**
     * @param {Planet} planet - The planet this guild is on.
     */
    constructor(planet = new Planet()) {
        super(planet, BUILDING_TYPES.GUILD)
        /** @type {Mission[]} */
        this.missions = []; // Mission[]
        this.normalize(true)
    }
    get baseNumMissions() {
        const multiplier = this.planet?.objectType?.powerMultiplier ?? 1
        return Math.round(GUILD_AVERAGE_NUM_MISSIONS*this.planet.c.economy*this.level*multiplier)
    }
    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.officers = []
            this.missions = []
        }
        
        // Normalize missions
        const missionDiffFromBase = this.missions.length - this.baseNumMissions
        if (missionDiffFromBase > 0) {
            this.missions.splice(0, missionDiffFromBase)
        } else if (missionDiffFromBase < 0) {
            for (let i = 0; i < -missionDiffFromBase; i++) {
                this.missions.push(generateMission(this.planet))
            }
        }
    }
}
