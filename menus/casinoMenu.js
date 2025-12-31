function showCasinoMenu(casino) {
    const { captain, credits, fleet } = gs

    const currentPrize = casino.getCurrentPrize()
    if (!currentPrize) {
        showModal('Casino', ce({ tag: 'p', text: 'No prizes available at this casino!' }), [
            ['Back', showPlanetMenu]
        ])
        return
    }

    const gambleCost = casino.getGambleCost()
    const canAfford = credits >= gambleCost

    // Build prize description
    let prizeDesc = ''
    if (currentPrize instanceof Ship) {
        prizeDesc = `${currentPrize.name} (${currentPrize.shipType.name})`
    } else if (currentPrize instanceof Equipment) {
        prizeDesc = `${currentPrize.name} (${currentPrize.equipmentType.name})`
    } else if (currentPrize instanceof CyberImplant) {
        prizeDesc = `${currentPrize.name} cyber implant`
    }

    const content = ce({
        children: [
            ce({ tag: 'p', text: `Welcome to the ${casino.planet.name} Casino!` }),
            ce({ tag: 'p', text: `The house is feeling generous today. Care to try your luck?` }),
            ce({ tag: 'hr' }),
            ce({ tag: 'h3', text: 'Current Prize:' }),
            ce({ tag: 'p', text: prizeDesc }),
            ce({ tag: 'p', text: `Prize Value: ${formatCredits(currentPrize.value)}` }),
            ce({ tag: 'hr' }),
            ce({ tag: 'p', text: `Cost to Gamble: ${formatCredits(gambleCost)}` }),
            ce({ tag: 'p', text: `Your Credits: ${formatCredits(credits)}` }),
            !canAfford ? ce({ tag: 'p', text: '(Insufficient funds)', style: { color: '#f44' } }) : null
        ]
    })

    const buttons = [
        canAfford ? ['Gamble', () => handleGamble(casino, currentPrize, gambleCost)] : null,
        ['Back', showPlanetMenu]
    ].filter(Boolean)

    showModal('Casino', content, buttons)
}

function handleGamble(casino, prize, cost) {
    const { captain, fleet } = gs

    // Deduct cost
    gs.credits -= cost

    // Roll for win (1 in 20 chance)
    const won = casino.gamble()

    if (won) {
        // Player won!
        if (prize instanceof Ship) {
            fleet.ships.push(prize)
            showModal('Casino - You Won!', ce({
                children: [
                    ce({ tag: 'h2', text: '🎉 JACKPOT! 🎉', style: { color: '#4f4' } }),
                    ce({ tag: 'p', text: `You won a ${prize.name} (${prize.shipType.name})!` }),
                    ce({ tag: 'p', text: `The ship has been added to your fleet.` })
                ]
            }), [
                ['Continue', () => showCasinoMenu(casino)]
            ])
        } else if (prize instanceof Equipment) {
            fleet.equipment.push(prize)
            showModal('Casino - You Won!', ce({
                children: [
                    ce({ tag: 'h2', text: '🎉 JACKPOT! 🎉', style: { color: '#4f4' } }),
                    ce({ tag: 'p', text: `You won ${prize.name} (${prize.equipmentType.name})!` }),
                    ce({ tag: 'p', text: `The equipment has been added to your inventory.` })
                ]
            }), [
                ['Continue', () => showCasinoMenu(casino)]
            ])
        } else if (prize instanceof CyberImplant) {
            captain.implants.push(prize)
            showModal('Casino - You Won!', ce({
                children: [
                    ce({ tag: 'h2', text: '🎉 JACKPOT! 🎉', style: { color: '#4f4' } }),
                    ce({ tag: 'p', text: `You won a ${prize.name} cyber implant!` }),
                    ce({ tag: 'p', text: `The implant has been added to your captain.` })
                ]
            }), [
                ['Continue', () => showCasinoMenu(casino)]
            ])
        }
    } else {
        // Player lost
        showModal('Casino - Better Luck Next Time', ce({
            children: [
                ce({ tag: 'p', text: 'The dice didn\'t roll in your favor this time.' }),
                ce({ tag: 'p', text: `You lost ${formatCredits(cost)}.` }),
                ce({ tag: 'p', text: 'Try again?' })
            ]
        }), [
            ['Continue', () => showCasinoMenu(casino)]
        ])
    }
}
