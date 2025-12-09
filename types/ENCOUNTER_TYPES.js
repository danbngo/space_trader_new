

class EncounterType {
    constructor(name = '', description = '', fleetType = FLEET_TYPES_ALL[0], onStart = ()=>{}, onVictory = ()=>{}, onDefeat = ()=>{}, onEscape = ()=>{}, onSurrender = ()=>{}) {
        this.name = name;
        this.description = description;
        this.fleetType = fleetType;
        this.onStart = onStart;
        this.onVictory = onVictory;
        this.onDefeat = onDefeat;
        this.onEscape = onEscape;
        this.onSurrender = onSurrender;
    }
}

const ENCOUNTER_TYPES = {
    PIRATES: new EncounterType('Pirates', 'You encountered: pirates.', FLEET_TYPES.PIRATES,
        ()=>{
            showModal('Pirates', 'The pirates demand that you allow them to loot you.', [
                ['Submit', ()=>{
                    gameState.encounter.encounterType.onSurrender()
                }],
                ['Resist', ()=>{
                    startCombat()
                }],
                ['View', ()=>{
                    closeModal()
                }]
            ])
        },
        ()=>{
            const fameAmount = gameState.encounter.fleet.ships.length*5
            const disabledEnemyShips = gameState.fleet.ships.filter(s=>s.isDisabled())
            let msg = `You defeated the pirates!<br/>`
            msg += `Your victory gains you ${fameAmount} fame.`
            gameState.fleet.captain.fame += fameAmount
            if (disabledEnemyShips > 0) msg += `The pirates left behind ${disabledEnemyShips.length} disabled ships!<br/>`
            showModal('Pirates', msg, [['Continue', ()=>endEncounter()]])
        },
        ()=>{
            const {fleet, encounter} = gameState
            let msg = ''  
            msg += 'The pirates eagerly board your ships.<br/>'
            const lootableCargoAmount = fleet.cargo.total
            if (lootableCargoAmount <= 0) {
                msg += 'They are disgusted to find nothing worth looting.<br/>'
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
        },
        ()=>{
            const fameAmount = gameState.encounter.fleet.ships.length
            const disabledPlayerShips = gameState.fleet.ships.filter(s=>s.isDisabled())
            let msg = `You escaped from the pirates.<br/>`
            msg += `Your daring escape gains you ${fameAmount} fame.`
            gameState.fleet.captain.fame += fameAmount
            if (disabledPlayerShips > 0) msg += `You left behind ${disabledPlayerShips.length} disabled ships!<br/>`
            //TODO: remove some cargo from the player's holds depending on the ships left behind
            gameState.fleet.ships = gameState.fleet.ships.filter(s=>(!s.isDisabled()))
            showModal('Pirates', msg, [['Continue', ()=>endEncounter()]])
        },
        ()=>{
            let msg = ''
            const famePenalty = 5
            msg += `Submitting to the ravages of the pirates causes you to lose ${famePenalty} fame.`
            gameState.fleet.captain.fame -= famePenalty
            showModal('Pirates', msg, [['Continue', ()=>gameState.encounter.encounterType.onDefeat()]])
        }
    )
}

const ENCOUNTER_TYPES_ALL = Object.values(ENCOUNTER_TYPES)

