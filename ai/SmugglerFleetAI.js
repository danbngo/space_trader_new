/**
 * AI for smuggler fleets - travels discreetly between planets, avoids police.
 * @class SmugglerFleetAI
 * @extends FleetAI
 */
class SmugglerFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
}
