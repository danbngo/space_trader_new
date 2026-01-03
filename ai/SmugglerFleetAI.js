/**
 * AI for smuggler fleets - travels discreetly between planets, avoids police.
 * @class SmugglerFleetAI
 * @extends FleetAI
 */
class SmugglerFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
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
