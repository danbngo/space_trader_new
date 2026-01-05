/**
 * @class MinersEncounter
 * @extends {NeutralsEncounter}
 */
class MinersEncounter extends NeutralsEncounter {
    onStart() {
        // Check if already met to prevent repeated resource exchanges
        if (this.hasAlreadyVisitedPlayer()) {
            this.showAlreadyMetMessage()
            return
        }
        
        if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.VILIFIED)) {
            showModal(coloredName(this.fleet), 'The miners have heard of your fearsome deeds and start fleeing immediately!', [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackModal()],
            ])
        }
        else {
            this.showNeutralMiners()
        }
    }

    onVictory() {
        // Randomize the mined asteroid's position after successful mining encounter
        if (this.minedAsteroid && this.minedAsteroid.belt) {
            this.minedAsteroid.belt.randomizeAsteroid(this.minedAsteroid)
            console.log('⛏️ Randomized asteroid after mining')
        }
        
        // Call parent implementation
        super.onVictory()
    }

    showNeutralMiners() {
        const rand = Math.random()
        
        // 50% chance to offer to sell their cargo
        if (rand < 0.5) {
            this.offerToSellCargo()
            return
        }
        
        // 50% chance to ignore
        showModal(coloredName(this.fleet), 'The miners transmit a surly, perfunctory greeting, but otherwise ignore you.', [
            //['View', ()=>closeModal()],
            ['Ignore', ()=>this.endEncounter()],
            ['Attack', ()=>this.showPlayerAttackModal()],
        ])
    }

    offerToSellCargo() {
        // Miners sell: metal, water (ice), isotopes, antimatter
        const minerCargoTypes = [CARGO_TYPES.METAL, CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES, CARGO_TYPES.ANTIMATTER]
        
        // Filter to only cargo types the miners actually have
        const availableCargo = minerCargoTypes.filter(ct => this.fleet.cargo.getAmount(ct) > 0)
        
        if (availableCargo.length === 0) {
            // No cargo to sell, fall back to default behavior
            showModal(coloredName(this.fleet), 'The miners transmit a surly, perfunctory greeting, but otherwise ignore you.', [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackModal()],
            ])
            return
        }
        
        const cargoType = rndMember(availableCargo)
        const amount = Math.min(this.fleet.cargo.getAmount(cargoType), rng(20, 5))
        const basePrice = cargoType.value * amount
        const price = Math.round(basePrice * 0.8 * this.planet.c.inflation) // 80% of base price
        const canAfford = gs.credits >= price
        const hasSpace = gs.fleet.availableCargoSpace >= amount
        
        let message = `The ${coloredName(this.fleet)} hail you:<br/><br/>`
        message += `"We've got extra ${cargoType.name} we're looking to offload. ${price} CR for ${amount} units. Interested?"<br/><br/>`
        message += `<b>${amount} ${cargoType.symbol} ${cargoType.name}</b><br/>`
        message += `<b>Price:</b> ${price} CR (${Math.round(price/amount)} CR/unit)`
        
        showModal(coloredName(this.fleet), message, [
            ['Buy', () => {
                gs.credits -= price
                this.fleet.cargo.increment(cargoType, -amount)
                gs.fleet.cargo.increment(cargoType, amount)
                showModal('Cargo Purchased',
                    `You transfer ${price} CR.<br/><br/>` +
                    `"Good deal. Safe travels."<br/><br/>` +
                    `<span style="color: #66ff66">Acquired ${amount} units of ${cargoType.name}!</span>`,
                    [['Continue', () => this.endEncounter()]]
                )
            }, !canAfford || !hasSpace],
            ['Decline', () => {
                showModal('Offer Declined',
                    `"Suit yourself. We'll sell it elsewhere."`,
                    [['Continue', () => this.endEncounter()]]
                )
            }],
        ])
    }

    offerToBuySupplies() {
        // Miners want to buy: nanites and medicine (for repairs and healing)
        const supplyTypes = [CARGO_TYPES.NANITES, CARGO_TYPES.MEDICINE]
        
        // Filter to only supplies the player actually has
        const availableSupplies = supplyTypes.filter(ct => gs.fleet.cargo.getAmount(ct) > 0)
        
        if (availableSupplies.length === 0) {
            // Player has no supplies, fall back to default behavior
            showModal(coloredName(this.fleet), 'The miners transmit a surly, perfunctory greeting, but otherwise ignore you.', [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackModal()],
            ])
            return
        }
        
        const supplyType = rndMember(availableSupplies)
        const amount = Math.min(gs.fleet.cargo.getAmount(supplyType), rng(10, 3))
        const basePrice = supplyType.value * amount
        const price = Math.round(basePrice * 1.2 * this.planet.c.inflation) // 120% of base price (premium)
        const hasEnough = gs.fleet.cargo.getAmount(supplyType) >= amount
        
        let message = `The ${coloredName(this.fleet)} hail you:<br/><br/>`
        message += `"We're running low on ${supplyType.name}. We need it for operations. Will pay ${price} CR for ${amount} units if you've got any to spare."<br/><br/>`
        message += `<b>${amount} ${supplyType.symbol} ${supplyType.name}</b><br/>`
        message += `<b>Offer:</b> ${price} CR (${Math.round(price/amount)} CR/unit)`
        
        showModal(coloredName(this.fleet), message, [
            ['Sell', () => {
                gs.credits += price
                gs.fleet.cargo.increment(supplyType, -amount)
                showModal('Supplies Sold',
                    `You receive ${price} CR.<br/><br/>` +
                    `"Much appreciated. This'll keep us going."<br/><br/>` +
                    `<span style="color: #ffff66">Sold ${amount} units of ${supplyType.name}!</span>`,
                    [['Continue', () => this.endEncounter()]]
                )
            }, !hasEnough],
            ['Decline', () => {
                showModal('Offer Declined',
                    `"Alright, we'll manage. Good luck out there."`,
                    [['Continue', () => this.endEncounter()]]
                )
            }],
        ])
    }
}
