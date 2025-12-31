function showCasinoMenu(casino) {
    const { captain, credits, fleet } = gs

    const currentPrize = casino.getCurrentPrize()
    if (!currentPrize) {
        showModal('Casino', 'No prizes available at this casino!', [
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
            `Welcome to the ${casino.planet.name} Casino<br/>
            The house is feeling generous today. Care to try your luck?<br/>
            Current Prize: ${prizeDesc}
            Prize Value: ${currentPrize.value}CR<br/>
            Cost to Gamble: ${gambleCost}CR<br/>
            Your Credits: ${credits}CR<br/>`
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
        let msg = '🎉 JACKPOT! 🎉<br/><br/>'
        if (prize instanceof Ship) {
            msg += `You won a ${prize.name} (${prize.shipType.name})!<br/>`
            msg += `The ship has been added to your fleet.`
        } else if (prize instanceof Equipment) {
            msg += `You won ${prize.name} (${prize.equipmentType.name})!<br/>`
            msg += `The equipment has been added to your inventory.`
        } else if (prize instanceof CyberImplant) {
            msg += `You won a ${prize.name} cyber implant!<br/>`
            msg += `The implant has been added to your captain.`
        }

        showModal('Casino - You Won!', msg, [
            ['Continue', () => showCasinoMenu(casino)]
        ])

        // Add prize to appropriate place
        if (prize instanceof Ship) {
            fleet.ships.push(prize)
        } else if (prize instanceof Equipment) {
            fleet.equipment.push(prize)
        } else if (prize instanceof CyberImplant) {
            captain.implants.push(prize)
        }
    } else {
        // Player lost
        const loseMsg = `The dice didn't roll in your favor this time.<br/><br/>You lost ${formatCredits(cost)}.<br/><br/>Try again?`
        showModal('Casino - Better Luck Next Time', loseMsg, [
            ['Continue', () => showCasinoMenu(casino)]
        ])
    }
}
