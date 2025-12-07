

// Cargo class
class Cargo {
    constructor(cargoCounts = new Map([[CARGO_TYPES_ALL[0],0]])) {
        this.cargoCounts = cargoCounts
        for (const ct of CARGO_TYPES_ALL) {
            if (!this.cargoCounts.has(ct)) this.cargoCounts.set(ct,0)
        }
    }

    getAmount(cargoType = CARGO_TYPES_ALL[0]) {
        return this.cargoCounts.get(cargoType)
    }

    increment(cargoType = CARGO_TYPES_ALL[0], amount = 0) {
        this.cargoCounts.set(cargoType, this.cargoCounts.get(cargoType) + amount)
    }

    setAmount(cargoType = CARGO_TYPES_ALL[0], amount = 0) {
        this.cargoCounts.set(cargoType, amount)
    }

    calcTotalCargo() {
        return calcMapValuesTotal(this.cargoCounts)
    }
    
    randomItem() {
        const ctWeights = []
        for (const ct of CARGO_TYPES_ALL) weights.push(this.getAmount(ct))
        const ctIndex = rndIndexWeighted(ctWeights)
        const ct = CARGO_TYPES_ALL[ctIndex]
        return ct
    }

    //probably not mathematically correct but oh well
    randomSubset(amount = 0) {
        const subset = new Cargo()
        amount = Math.min(this.calcTotalCargo(), amount)
        while (amount > 0) {
            const ct = this.randomItem()
            if (subset.getAmount(ct) > this.getAmount(ct)) continue
            subset.increment(ct, 1)
        }
        return subset
    }

    add(addedCargo = new Cargo()) {
        for (const ct of CARGO_TYPES_ALL) {
            const amount = addedCargo.getAmount(ct)
            this.increment(ct, amount)
        }
    }

    subtract(subtractedCargo = new Cargo()) {
        for (const ct of CARGO_TYPES_ALL) {
            const amount = subtractedCargo.getAmount(ct)
            this.increment(ct, -amount)
        }
    }
}
