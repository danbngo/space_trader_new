/**
 * AI for merchant fleets - travels between planets to trade.
 * @class MerchantFleetAI
 * @extends FleetAI
 */
class MerchantFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }

    onNearDestination() {
        // Trade at destination: reserve cargo from market, unload our cargo, load reserved cargo
        if (this.destination && this.destination instanceof Planet && this.destination.s && this.destination.s.market) {
            const market = this.destination.s.market
            const availableSpace = this.fleet.availableCargoSpace
            
            // Reserve some cargo from the market (random subset up to available space)
            const reserveAmount = Math.min(availableSpace, Math.ceil(market.cargo.total * 0.3))
            const reservedCargo = market.cargo.randomSubset(reserveAmount)
            
            // Unload our cargo into the market
            for (const [cargoType, amount] of this.fleet.cargo.counts.entries()) {
                market.cargo.increment(cargoType, amount)
            }
            this.fleet.cargo.clear()
            
            // Load the reserved cargo
            for (const [cargoType, amount] of reservedCargo.counts.entries()) {
                market.cargo.increment(cargoType, -amount)
                this.fleet.cargo.increment(cargoType, amount)
            }
            
            console.log(`💰 ${this.fleet.name} traded at ${this.destination.name}: unloaded cargo and loaded ${reservedCargo.total} units`)
            
            // Show trade popup
                this.starMap.addPopup(this.fleet.x, this.fleet.y, '💲', COLORS.Green, 2000)
        }
        
        super.onNearDestination()
    }

    onNearOrigin() {
        // Unload all cargo at origin market
        if (this.origin && this.origin instanceof Planet &&this.origin.s && this.origin.s.market) {
            const market = this.origin.s.market
            
            // Add all our cargo to the market
            for (const [cargoType, amount] of this.fleet.cargo.counts.entries()) {
                market.cargo.increment(cargoType, amount)
            }
            this.fleet.cargo.clear()
            
            console.log(`💰 ${this.fleet.name} unloaded all cargo at ${this.origin.name}`)
            
                this.starMap.addPopup(this.fleet.x, this.fleet.y, '💲', COLORS.Green, 2000)
        }
        
        super.onNearOrigin()
    }
}
