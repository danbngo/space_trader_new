function checkForEvents(elapsedYears = 1) {
    const elapsedDays = elapsedYears*365
    if (checkGameOver()) return
    if (checkForEncounter(elapsedDays)) return
    if (checkDebtCollections(elapsedDays)) return
}

function checkForEncounter(elapsedDays = 1) {
    //dont have encounters while docked or already in an encounter
    if (gs.location || gs.encounter) return
    const encounterChance = 1 - Math.pow(1-ENCOUNTER_CHANCE_PER_DAY, elapsedDays)
    const didEncounter = Math.random() < encounterChance
    if (!didEncounter) return
    if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
    startEncounter()
    return true
}

function checkDebtCollections(elapsedDays = 1) {
    //check for bank bounty collection
    const outstandingDebts = gs.captain.calcTotalDebts(true)
    if (outstandingDebts <= 0) return
    const bountyChance = 1 - Math.pow(1-BANK_BOUNTY_CHANCE_PER_DAY, elapsedDays)
    const didCollectBounty = Math.random() < bountyChance
    if (!didCollectBounty) return
    const totalDebts = gs.captain.calcTotalDebts(true)
    const convertedAmt = Math.min(totalDebts, 100 + rng( Math.ceil(totalDebts/3), Math.ceil(totalDebts/6) ))
    const fees = Math.ceil(convertedAmt * 0.5)
    payDebtsRandomly(gs.captain, convertedAmt)
    gs.bounty += (convertedAmt + fees)
    let msg = `The bank isn't happy that you haven't paid your overdue loans of ${totalDebts}CR.<br/>`
    msg += `They have passed a portion of your debt, plus fees on to some rather ruthless collection agencies.<br/>`
    msg += `Your new bounty: ${gs.captain.bounty}CR<br/>`
    msg += `Your new total overdue debt: ${outstandingDebts-convertedAmt}CR<br/>`
    if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
    showModal('Bank: Collections', msg, [['Continue', ()=> closeModal()]])
    return true
}


function payDebtsRandomly(officer = new Officer(), amount = 0) {
    const overdueLoans = officer.loans.filter(l=>l.overdue && l.outstandingBalance > 0)
    if (overdueLoans.length == 0) return
    const loan = rndMember(overdueLoans)
    loan.repay(Math.min(amount, loan.outstandingBalance))
    payDebtsRandomly(officer, amount - Math.min(amount, loan.outstandingBalance))
}

function checkGameOver() {
    if (gs.year < GAME_END_YEAR) return
    //game over - reached end of time period
    if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
    let msg = ''
    msg += `Congratulations, you have reached the end of the year ${GAME_END_YEAR}!<br/>Thank you for playing!<br/>`
    const scoreDetails = calcPlayerScore()
    msg += `Your final score is ${scoreDetails.total} points.<br/>`
    msg += `Score breakdown:<br/>`
    msg += `* Ships: ${scoreDetails.shipsScore}<br/>`
    msg += `* Credits: ${scoreDetails.creditsScore}<br/>`
    msg += `* Officers: ${scoreDetails.officerScore}<br/>`
    msg += `* Cargo: ${scoreDetails.cargoScore}<br/>`
    msg += `* Fame: ${scoreDetails.fameScore}<br/>`
    msg += `* Infamy: ${scoreDetails.infamyScore}<br/>`
    msg += `* Bounty: ${scoreDetails.bountyScore}<br/>`
    showModal('Game Over', msg, [['Restart Game', ()=> startNewGame()]])
    return true
}


function calcPlayerScore() {
    let shipsScore = 0;
    for (const ship of gs.fleet.ships) {
        shipsScore += Math.round(ship.value);
    }

    let creditsScore = gs.credits;

    let officerScore = 0;
    for (const officer of gs.captain.fleet.officers) {
        officerScore += Math.round(officer.value);
    }

    let cargoScore = 0;
    for (const [ct,amt] of gs.fleet.cargo.counts) {
        console.log('ct, amt:', ct, amt);
        cargoScore += (ct.value || 0) * (amt || 0);
    }

    const fameScore = gs.captain.fame * 10;
    const infamyScore = gs.captain.infamy * -10;
    const bountyScore = gs.captain.bounty * -1;

    const total = shipsScore + creditsScore + officerScore + fameScore + infamyScore + bountyScore + cargoScore;
    return { total, shipsScore, creditsScore, officerScore, fameScore, infamyScore, bountyScore, cargoScore };
}