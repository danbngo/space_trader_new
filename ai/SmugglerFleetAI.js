/**
 * AI for smuggler fleets - travels discreetly between planets, avoids police.
 * @class SmugglerFleetAI
 * @extends FleetAI
 */
class SmugglerFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }

    onNearDestination() {
        // Smuggler trade at destination: dump cargo, boost corruption and economy
        if (this.destination && this.destination instanceof Planet && this.destination.s && this.destination.s.market) {
            this.destination.c.economy *= 1.01; // Boost economy through black market trade
            this.destination.c.corruption *= 1.01; // Increase corruption from illicit activity
            const market = this.destination.s.market
            
            // Unload our cargo into the market
            for (const [cargoType, amount] of this.fleet.cargo.counts.entries()) {
                market.cargo.increment(cargoType, amount)
            }
            this.fleet.cargo.clear()
            
            console.log(`🚨 ${this.fleet.name} smuggled cargo into ${this.destination.name}`)
            
            // Show smuggling popup
            this.addPopup('💲', COLORS.Red)
        }
        
        super.onNearDestination()
    }

    onDestroyed() {
        // Destroying smugglers reduces criminal activity
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.crime *= 0.99;
            this.fleet.planet.c.corruption *= 0.99
            this.fleet.planet.c.economy *= 0.99;
        }
        super.onDestroyed()
    }
}
