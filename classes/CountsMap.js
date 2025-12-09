

// Cargo class
class CountsMap {
    constructor(counts = new Map([['key',0]])) {
        this.counts = counts
    }

    getAmount(key = 'key') {
        return this.counts.get(key) || 0
    }

    increment(key = 'key', amount = 0) {
        this.counts.set(key, this.counts.get(key) + amount)
    }

    setAmount(key = 'key', amount = 0) {
        this.counts.set(key, amount)
    }

    get total() {
        return calcMapValuesTotal(this.counts)
    }
    
    randomItem() {
        const ctWeights = []
        const keys = this.counts.keys()
        for (const ct of keys) weights.push(this.getAmount(ct))
        const ctIndex = rndIndexWeighted(ctWeights)
        const ct = keys[ctIndex]
        return ct
    }

    //probably not mathematically correct but oh well
    randomSubset(amount = 0) {
        const subset = new CountsMap()
        amount = Math.min(this.total, amount)
        while (amount > 0) {
            const ct = this.randomItem()
            if (subset.getAmount(ct) > this.getAmount(ct)) continue
            subset.increment(ct, 1)
        }
        return subset
    }

    add(added = new CountsMap()) {
        for (const [key, amount] of added.counts) {
            this.increment(key, amount)
        }
    }

    subtract(subtracted = new CountsMap()) {
        for (const [key, amount] of subtracted.counts) {
            this.increment(key, -amount)
        }
    }
}
