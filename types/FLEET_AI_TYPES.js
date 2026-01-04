/**
 * @fileoverview Defines AI types for different fleet behaviors.
 * @module types/FLEET_AI_TYPES
 */

/**
 * @class FleetAIType
 * @classdesc Represents a type of fleet AI behavior.
 * @property {string} name - The name of the AI type.
 * @property {class} aiClass - The AI class constructor.
 * @property {FleetType} fleetType - The associated fleet type.
 */
class FleetAIType {
    constructor(name = '', aiClass = FleetAI, fleetType = null) {
        this.name = name;
        this.aiClass = aiClass;
        this.fleetType = fleetType;
    }
}

const FLEET_AI_TYPES = {
    MINER: new FleetAIType('Miner AI', MinerFleetAI, FLEET_TYPES.MINERS),
    MERCHANT: new FleetAIType('Merchant AI', MerchantFleetAI, FLEET_TYPES.MERCHANTS),
    SMUGGLER: new FleetAIType('Smuggler AI', SmugglerFleetAI, FLEET_TYPES.SMUGGLERS),
    PIRATE: new FleetAIType('Pirate AI', PirateFleetAI, FLEET_TYPES.PIRATES),
    POLICE: new FleetAIType('Police AI', PoliceFleetAI, FLEET_TYPES.POLICE),
    SOLDIER: new FleetAIType('Soldier AI', SoldierFleetAI, FLEET_TYPES.SOLDIERS),
    MERCENARY: new FleetAIType('Mercenary AI', MercenaryFleetAI, FLEET_TYPES.MERCENARIES),
    BOUNTY_HUNTER: new FleetAIType('Bounty Hunter AI', BountyHunterFleetAI, FLEET_TYPES.BOUNTY_HUNTERS),
    TOURIST: new FleetAIType('Tourist AI', TouristFleetAI, FLEET_TYPES.TOURISTS),
    COLONIST: new FleetAIType('Colonist AI', ColonistFleetAI, FLEET_TYPES.COLONISTS),
    SCIENTIST: new FleetAIType('Scientist AI', ScientistFleetAI, FLEET_TYPES.SCIENTISTS),
    SLAVER: new FleetAIType('Slaver AI', SlaverFleetAI, FLEET_TYPES.SLAVERS),
    PILGRIM: new FleetAIType('Pilgrim AI', PilgrimFleetAI, FLEET_TYPES.PILGRIMS),
    INQUISITOR: new FleetAIType('Inquisitor AI', InquisitorFleetAI, FLEET_TYPES.INQUISITORS),
    MISSIONARY: new FleetAIType('Missionary AI', MissionaryFleetAI, FLEET_TYPES.MISSIONARIES),
    DIPLOMAT: new FleetAIType('Diplomat AI', DiplomatFleetAI, FLEET_TYPES.DIPLOMATS),
    SALVAGER: new FleetAIType('Salvager AI', SalvagerFleetAI, FLEET_TYPES.SALVAGERS),
    TAX_COLLECTOR: new FleetAIType('Tax Collector AI', TaxCollectorFleetAI, FLEET_TYPES.TAX_COLLECTORS),
    REBEL: new FleetAIType('Rebel AI', RebelFleetAI, FLEET_TYPES.REBELS),
    REFUGEE: new FleetAIType('Refugee AI', RefugeeFleetAI, FLEET_TYPES.REFUGEES),
    SYNDICATE: new FleetAIType('Syndicate AI', SyndicateFleetAI, FLEET_TYPES.SYNDICATES),
    EXPLORER: new FleetAIType('Explorer AI', ExplorerFleetAI, FLEET_TYPES.EXPLORERS),
    HACKER: new FleetAIType('Hacker AI', HackerFleetAI, FLEET_TYPES.HACKERS),
}

const FLEET_AI_TYPES_ALL = Object.values(FLEET_AI_TYPES)

/**
 * Gets the appropriate AI type for a fleet type.
 * @param {FleetType} fleetType - The fleet type.
 * @returns {FleetAIType}
 */
function getFleetAITypeForFleetType(fleetType) {
    for (const aiType of FLEET_AI_TYPES_ALL) {
        if (aiType.fleetType === fleetType) {
            return aiType;
        }
    }
    return null;
}
