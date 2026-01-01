/**
 * AI for colonist fleets - travels to establish new colonies.
 * @class ColonistFleetAI
 * @extends FleetAI
 */
class ColonistFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
}
