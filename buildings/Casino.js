/**
 * A casino building where players can gamble for prizes.
 * @class Casino
 * @extends {Building}
 */
class Casino extends Building {
    /**
     * @param {Planet} planet - The planet this casino is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.CASINO, moon)
        /** @type {Array<Ship|Equipment|CyberImplant>} */
        this.prizes = []
        /** @type {number} */
        this.currentPrizeIndex = 0
        this.normalize()
    }

    normalize() {
        super.normalize()
        // Number of prizes based on corruption (more corrupt = more prizes)
        const corruption = this.planet.civilization ? this.planet.civilization.corruption : 1.0
        const numPrizes = Math.max(3, Math.round(5 + corruption * 10))
        
        this.prizes = generateCasinoPrizes(this.planet, numPrizes)
        this.currentPrizeIndex = 0
    }

    get currentPrize() {
        if (this.currentPrizeIndex >= this.prizes.length) return null
        return this.prizes[this.currentPrizeIndex]
    }

    get hasMorePrizes() {
        return this.currentPrizeIndex < this.prizes.length
    }

    advancePrize() {
        this.currentPrizeIndex++
    }

    /**
     * Gets the cost to gamble for the current prize.
     * @returns {number} The gambling cost in credits.
     */
    getGambleCost() {
        const prize = this.currentPrize
        if (!prize) return 0
        
        let prizeValue = 0
        if (prize instanceof Ship) {
            prizeValue = prize.value
        } else if (prize instanceof Equipment) {
            prizeValue = prize.value
        } else if (prize instanceof CyberImplant) {
            prizeValue = prize.value
        }
        
        return Math.round(prizeValue * 0.1)
    }

    /**
     * Performs a gamble attempt.
     * @returns {boolean} True if the player won.
     */
    gamble() {
        const winChance = 1 / 20 // 5% chance to win
        return Math.random() < winChance
    }
}
