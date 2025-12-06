class CargoType {
    constructor(name = '', value = 1, illegal = false) {
        this.name = name
        this.value = value
        this.illegal = illegal
    }
}

const CARGO_TYPES = {
    METAL: new CargoType('Metal', 100, false),
    ICE: new CargoType('Ice', 200, false),
    ISOTOPES: new CargoType('Isotopes', 400, false),
    NANITES: new CargoType('Nanites', 200, false),
    BIOGEL: new CargoType('Bio-gel', 400, false),
    HOLOCUBES: new CargoType('Holocubes', 800, false),
    WEAPONS: new CargoType('Weapons', 400, true),
    CLONES: new CargoType('Clones', 800, true),
    DRUGS: new CargoType('Drugs', 1600, true),
}
const CARGO_TYPES_ALL = Object.values(CARGO_TYPES)

class ShipType {
    constructor(name = '', hull = 1, shields = 1, lasers = 1, thrusters = 1, cargoSpace = 1) {
        this.name = name
        this.hull = hull
        this.shields = shields
        this.lasers = lasers
        this.thrusters = thrusters
        this.cargoSpace = cargoSpace
    }
}

const SHIP_TYPES = {
    TRANSPORT: new ShipType('Transport', 1, 1/2, 1/4, 2, 2),
    CARGO_SHIP: new ShipType('Cargo Ship', 1, 1/4, 1/4, 1, 4),
    SCOUT: new ShipType('Scout', 1, 1, 1, 3, 1/2),
    GUARD_SHIP: new ShipType('Gaurd Ship', 1, 2, 1, 1, 1/2),
    DESTROYER: new ShipType('Destroyer', 2, 2, 4, 1, 1/2),
    BATTLESHIP: new ShipType('Battleship', 4, 4, 3, 1/2, 1),
    MINING_SHIP: new ShipType('Mining Ship', 2, 1, 1, 1/2, 2),
    PRIVATEER: new ShipType('Privateer', 1, 4, 1, 3, 2),
}

const SHIP_TYPES_ALL = Object.values(SHIP_TYPES)

class FleetType {
    constructor(name = '', shipTypes = [], minShips = 1, maxShips = 1, cargoTypes = []) {
        this.name = name
        this.shipTypes = shipTypes
        this.minShips = minShips
        this.maxShips = maxShips
        this.cargoTypes = cargoTypes
    }
}

const FLEET_TYPES = {
    PATROL: new FleetType('Patrol', [SHIP_TYPES.GUARD_SHIP], 1, 5, []),
    BOUNTY_HUNTERS: new FleetType('Bounty Hunters', [SHIP_TYPES.DESTROYER, SHIP_TYPES.SCOUT], 1, 3, []),
    MINERS: new FleetType('Miners', [SHIP_TYPES.MINING_SHIP, SHIP_TYPES.GUARD_SHIP], 1, 3, [CARGO_TYPES.ICE, CARGO_TYPES.METAL, CARGO_TYPES.ISOTOPES]),
    WAR_FLEET: new FleetType('War Fleet', [SHIP_TYPES.BATTLESHIP, SHIP_TYPES.DESTROYER, SHIP_TYPES.SCOUT], 1, 5, []),
    SCOUTING_PARTY: new FleetType('Scouting Party', [SHIP_TYPES.SCOUT], 1, 3, []),
    EXPLORERS: new FleetType('Explorers', [SHIP_TYPES.SCOUT, SHIP_TYPES.PRIVATEER], 1, 3, [CARGO_TYPES.BIOGEL, CARGO_TYPES.HOLOCUBES, CARGO_TYPES.NANITES]),
    SMUGGLERS: new FleetType('Smugglers', [SHIP_TYPES.PRIVATEER], 1, 3, [CARGO_TYPES.DRUGS, CARGO_TYPES.CLONES, CARGO_TYPES.WEAPONS]),
    MERCHANTS: new FleetType('Merchants', [SHIP_TYPES.CARGO_SHIP, SHIP_TYPES.GUARD_SHIP], 1, 5, CARGO_TYPES_ALL.filter(ct=>(!ct.illegal))),
    PIRATES: new FleetType('Pirates', [SHIP_TYPES.PRIVATEER, SHIP_TYPES.BATTLESHIP], 1, 5, CARGO_TYPES_ALL),
}

const FLEET_TYPES_ALL = Object.values(FLEET_TYPES)


class EncounterType {
    constructor(name = '', description = '', fleetType = FLEET_TYPES_ALL[0], onStart = ()=>{}, afterDefeated = ()=>{}) {
        this.name = name;
        this.description = description;
        this.fleetType = fleetType;
        this.onStart = onStart;
        this.afterDefeated = afterDefeated;
    }
}

const ENCOUNTER_TYPES = {
    PIRATES: new EncounterType('Pirates', 'You encountered: pirates.', FLEET_TYPES.PIRATES,
        ()=>{
            showModal('Pirates', 'The pirates demand that you allow them to loot you.', [
                ['Submit', ()=>{
                    gameState.encounter.encounterType.afterDefeated()
                }],
                ['Resist', ()=>{
                    startCombat()
                }]
            ])
        },
        ()=>{
            const {fleet, encounter} = gameState
            let msg = 'The pirates eagerly board your ships.<br/>'
            const lootableCargoAmount = fleet.cargo.calcTotalCargo()
            if (lootableCargoAmount <= 0) {
                msg += 'They are disgusted to find no loot aboard your ships.<br/>'
            }
            else {
                const piratesCanLootAmount = encounter.fleet.calcAvailableCargoSpace()
                if (piratesCanLootAmount <= 0) {
                    //this should not happen, as generators always leave a little room for cargo
                    msg += 'They are embarassed to find their cargo bays are too full to hold any more loot.<br/>'
                }
                else {
                    const maxLootAmount = Math.min(piratesCanLootAmount, lootableCargoAmount)
                    const lootAmount = rng(maxLootAmount, maxLootAmount/2)
                    msg += `They take ${lootAmount} units of loot from your cargo bays.<br/>`
                    const looted = fleet.cargo.randomSubset(lootAmount)
                    fleet.cargo.subtract(looted)
                    //encounter.fleet.add(looted) //not really needed
                }
            }
            if (fleet.captain.credits <= 10) {
                msg += `They note with contempt that you have ${fleet.captain.credits == 0 ? 'no' : 'barely any'} credits to steal.<br/>`
            }
            else {
                const stolenCreditsAmount = rng(fleet.captain.credits*0.5, fleet.captain.credits*0.1)
                msg += `They gleefully help themselves to ${stolenCreditsAmount} of your credits.<br/>`
            }
            msg += `The pirates thank you sardonically for your time and depart.<br/>`
            showModal('Pirates', msg, [['Continue', ()=>endEncounter()]])
        }
    )
}

const ENCOUNTER_TYPES_ALL = Object.values(ENCOUNTER_TYPES)