

/**
 * A map that tracks counts/amounts of various items or entities.
 * @class CountsMap
 */
class CountsMap {
    /**
     * @param {Map<any,number>} counts - A map of items to their counts.
     */
    constructor(counts = new Map()) {
        /** @type {Map<any,number>} */
        this.counts = counts
    }

    clone() {
        const newCounts = new Map()
        for (const [key, amt] of this.counts) {
            newCounts.set(key, amt)
        }
        return new CountsMap(newCounts)
    }

    getAmount(key = {}) {
        return this.counts.get(key) || 0
    }

    get size() {
        return this.counts.size
    }

    increment(key = {}, amt = 1) {
        const newAmt = this.getAmount(key) + amt
        if (newAmt <= 0) {
            this.counts.delete(key)
            return
        }
        this.counts.set(key, newAmt)
    }

    multiply(key = {}, amt = 1) {
        const newAmt = this.getAmount(key) * amt
        if (newAmt <= 0) {
            this.counts.delete(key)
            return
        }
        this.counts.set(key, newAmt)
    }

    raiseTo(key = {}, amt = 1) {
        const currentAmt = this.getAmount(key)
        if (amt > currentAmt) {
            this.counts.set(key, amt)
        }
    }

    setAmount(key = {}, amt = 0) {
        this.counts.set(key, amt)
    }

    get average() {
        return this.total/this.size
    }

    get total() {
        return calcMapValuesTotal(this.counts)
    }
    
    randomItem(weighted = true) {
        const ctWeights = []
        const keys = Array.from(this.keys)
        for (const ct of keys) ctWeights.push(weighted ? this.getAmount(ct) : (this.getAmount(ct) > 0 ? 1 : 0))
        console.log('ct weights:',ctWeights)
        console.log('keys:',keys)
        const ctIndex = rndIndexWeighted(ctWeights)
        const ct = keys[ctIndex]
        console.log('random ct index:',ctIndex,'ct selected:',ct,'from keys:',keys)
        return ct
    }

    clear() {
        this.counts.clear()
    }

    get keys() {
        return Array.from(this.counts.keys())
    }

    /**
     * Normalizes all numeric values so they maintain the same ratios but sum to toAmount.
     * @param {number} toAmount - The target sum (default 1.0 for percentages)
     */
    normalize(toAmount = 1.0) {
        const currentTotal = this.total
        if (currentTotal === 0 || currentTotal === toAmount) return
        
        const multiplier = toAmount / currentTotal
        for (const [key, value] of this.counts.entries()) {
            this.counts.set(key, value * multiplier)
        }
    }

    //probably not mathematically correct but oh well
    randomSubset(amt = 0) {
        const subset = new CountsMap()
        amt = Math.min(this.total, amt)
        while (amt > 0) {
            const ct = this.randomItem()
            console.log('amt left to pick:',amt,'ct selected:',ct,'source amt:',this.getAmount(ct),'subset amt:',subset.getAmount(ct))
            if (!ct) break
            if (subset.getAmount(ct) > this.getAmount(ct)) continue
            subset.increment(ct, 1)
            amt--
            console.log('added:',ct,'amt remaining:',amt)
        }
        return subset
    }

    addAmounts(added = new CountsMap()) {
        for (const [key, amt] of added.counts) {
            this.increment(key, amt)
        }
    }

    subtractAmounts(subtracted = new CountsMap()) {
        for (const [key, amt] of subtracted.counts) {
            this.increment(key, -amt)
        }
    }

    has(key = {}) {
        return this.getAmount(key) > 0
    }

    toJSON() {
        // Custom serialization for JSON.stringify
        // Convert Map to object, handling Planet keys specially
        const obj = {}
        for (const [key, amount] of this.counts) {
            // If key has a .name property (like Planet), use the name as the key
            const jsonKey = key?.name || String(key)
            obj[jsonKey] = amount
        }
        return { counts: obj }
    }

    calcInvertedMultipliers() {
        const inverted = new CountsMap()
        for (const [key, value] of this.counts) {
            if (value !== 0) {
                inverted.setAmount(key, 1 / value)
            }
        }
        return inverted
    }

    /**
     * Returns the key with the highest value in the map.
     * @returns {any|null} The key with the highest value, or null if empty.
     */
    calcHighestKey() {
        if (this.counts.size === 0) return null
        
        let maxKey = null
        let maxValue = -Infinity
        
        for (const [key, value] of this.counts) {
            if (value > maxValue) {
                maxValue = value
                maxKey = key
            }
        }
        
        return maxKey
    }

    //returns keys as an array, sorted highest value to lowest
    calcHighestKeys() {
        const entriesArray = Array.from(this.counts.entries())
        entriesArray.sort((a, b) => b[1] - a[1]) // Sort descending by value
        return entriesArray.map(entry => entry[0]) // Return sorted keys
    }
}
