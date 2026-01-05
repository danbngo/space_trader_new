/**
 * @class SalvagersEncounter
 * @extends {NeutralsEncounter}
 */
class SalvagersEncounter extends NeutralsEncounter {
    onStart() {
        // Check if already met to prevent repeated item offers
        if (this.hasAlreadyVisitedPlayer()) {
            this.showAlreadyMetMessage()
            return
        }
        
        // 50% chance to offer mystery item
        if (Math.random() < 0.5) {
            this.offerMysteryItem()
        } else {
            this.showStandardGreeting()
        }
    }
    
    offerMysteryItem() {
        // Roll all 3 possible items to calculate average price
        const cyberImplant = generateCyberImplant(this.planet)
        const shipModuleType = rndMember(SHIP_MODULE_TYPES_ALL)
        const shipModule = new ShipModule(shipModuleType, this.planet.c?.technology || 1)
        const naniteValue = CARGO_TYPES.NANITES.value
        
        // Calculate average value
        const averageValue = Math.round((cyberImplant.value + (shipModule.moduleType.value * shipModule.quality) + naniteValue) / 3)
        const canAfford = gs.credits >= averageValue
        
        // Store the rolled items for later
        this.rolledItems = [
            { type: 'cyber', item: cyberImplant },
            { type: 'shipModule', item: shipModule },
            { type: 'nanite', item: null }
        ]
        
        let message = `The ${coloredName(this.fleet)} hail you with an offer:<br/><br/>`
        message += `"Hey there! We just pulled something really nice from a wreck. Don't have time to appraise it properly, but it's valuable. `
        message += `Could be cyberware, could be a ship module... hell, might even be junk. ${averageValue} CR and it's yours - sight unseen."<br/><br/>`
        message += `<span style="color: #ff9999">⚠️ The item will be randomly selected from: Cyber Implant, Ship Module, or Nanites!</span>`
        
        showModal(coloredName(this.fleet), message, [
            ['Buy', () => {
                gs.credits -= averageValue
                
                // Randomly pick one of the 4 items
                const chosen = rndMember(this.rolledItems)
                
                if (chosen.type === 'cyberImplant') {
                    this.giveCyberImplant(chosen.item, averageValue)
                } else if (chosen.type === 'shipModule') {
                    this.giveShipModule(chosen.item, averageValue)
                } else {
                    this.giveNanite(averageValue)
                }
            }, !canAfford],
            ['Decline', () => this.showStandardGreeting()],
            ['Ignore', () => this.endEncounter()],
        ])
    }
    
    giveCyberImplant(cyberImplant, price) {
        // Cyber implant goes to fleet inventory
        gs.fleet.cyberModules.push(cyberImplant)
        
        showModal('Cyber Implant Acquired',
            `You transfer ${price} CR and receive:<br/><br/>` +
            `<b>${cyberImplant.implantType.name}</b> (Quality: ${cyberImplant.quality.toFixed(2)})<br/>` +
            `${cyberImplant.implantType.description}<br/>` +
            `Value: ${cyberImplant.value} CR<br/><br/>` +
            `"Score! It's been added to your fleet's inventory."`,
            [['Continue', () => this.endEncounter()]]
        )
    }
    
    giveShipModule(shipModule, price) {
        // Ship module goes to shipyard if docked
        if (gs.fleet.location && gs.fleet.location.settlement && gs.fleet.location.settlement.shipyard) {
            gs.fleet.location.settlement.shipyard.modules.push(shipModule)
            
            showModal('Ship Module Acquired',
                `You transfer ${price} CR and receive:<br/><br/>` +
                `<b>${shipModule.moduleType.name}</b> (Quality: ${shipModule.quality.toFixed(2)})<br/>` +
                `${shipModule.moduleType.description}<br/>` +
                `Value: ${Math.round(shipModule.moduleType.value * shipModule.quality)} CR<br/><br/>` +
                `"Nice find! Check the shipyard to install it."`,
                [['Continue', () => this.endEncounter()]]
            )
        } else {
            showModal('Not Docked',
                `The salvager shakes their head:<br/><br/>` +
                `"Can't hand over ship modules while you're not docked at a settlement with a shipyard. Come back when you've landed somewhere."`,
                [['Continue', () => this.endEncounter()]]
            )
        }
    }
    
    giveNanite(price) {
        // Check if player has cargo space for 1 nanite
        if (gs.fleet.availableCargoSpace >= 1) {
            gs.fleet.cargo.increment(CARGO_TYPES.NANITES, 1)
            
            showModal('Nanites Acquired',
                `You transfer ${price} CR and receive:<br/><br/>` +
                `The salvagers hand you a small container...<br/><br/>` +
                `<b>1 unit of Nanites</b><br/>` +
                `Value: ${CARGO_TYPES.NANITES.value} CR<br/><br/>` +
                `"Uh... looks like this one was mostly junk. Sorry about that!"<br/><br/>` +
                `<span style="color: #ff6666">You overpaid by ${price - CARGO_TYPES.NANITES.value} CR!</span>`,
                [['Continue', () => this.endEncounter()]]
            )
        } else {
            // No cargo space - discard the nanite
            showModal('No Cargo Space',
                `You transfer ${price} CR and receive:<br/><br/>` +
                `The salvagers hand you a container of nanites, but you don't have cargo space!<br/><br/>` +
                `You're forced to discard them immediately.<br/><br/>` +
                `"Tough break. That's the risk with mystery salvage!"<br/><br/>` +
                `<span style="color: #ff6666">You paid ${price} CR for nothing!</span>`,
                [['Continue', () => this.endEncounter()]]
            )
        }
    }
    
    showStandardGreeting() {
        showModal(coloredName(this.fleet), 'A salvage fleet is busy scanning for debris and wrecks. They barely notice your ship as they continue their search for valuable scrap.', [
            ['Continue', () => this.endEncounter()],
        ])
    }
}
