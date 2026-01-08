/**
 * A building where the player can take on government missions and advance their rank.
 * @class Palace
 * @extends {Building}
 */
class Palace extends Building {
    /**
     * @param {Planet} planet - The planet this palace is on.
     */
    constructor(planet = new Planet()) {
        super(planet, BUILDING_TYPES.PALACE)
        /** @type {Mission[]} */
        this.missions = []; // Mission[]
        this.normalize(true)
    }

    get baseNumMissions() {
        return Math.round(PALACE_AVERAGE_NUM_MISSIONS * this.planet.c.culture/this.planet.c.corruption)
    }

    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.missions = []
        }
        
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
