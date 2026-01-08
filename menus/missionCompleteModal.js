/**
 * Shows a modal when a mission is completed or failed
 * @param {Mission} mission - The completed/failed mission
 */
function showMissionCompleteModal(mission) {
    const isSuccess = mission.succeeded === true
    const title = isSuccess ? '✓ Mission Completed!' : '✗ Mission Failed'
    const titleColor = isSuccess ? COLORS.LightGreen : COLORS.Red
    
    const content = ce({children: [
        colorSpan(mission.missionType.name, mission.missionType.color),
        ce({tag: 'br'}),
        ce({tag: 'br'}),
        mission.missionType.description,
        ce({tag: 'br'}),
        ce({tag: 'br'}),
        isSuccess 
            ? colorSpan(`You have earned ${mission.reward} CR!`, COLORS.LightGreen)
            : colorSpan('Mission expired before completion.', COLORS.Red),
        ce({tag: 'br'}),
        ce({tag: 'br'}),
        `Progress: ${mission.amountFulfilled} / ${mission.amount}`,
    ]})
    
    const onClose = () => {
        closeModal()
        // Return to planet menu if docked
        if (gs.fleet.location) {
            showPlanetMenu(gs.fleet.location)
        }
    }
    
    showModal(colorSpan(title, titleColor), content, [['Continue', onClose]])
    
    // Award credits if successful
    if (isSuccess) {
        gs.credits += mission.reward
    }
}

/**
 * Check for expired missions and move them to oldMissions
 */
function checkExpiredMissions() {
    const expiredMissions = gs.missions.filter(m => m.isExpired)
    
    for (const mission of expiredMissions) {
        mission.refreshSuccessState()
        safeRemove(gs.missions, mission)
        gs.oldMissions.push(mission)
        
        // Show modal for expired mission
        showMissionCompleteModal(mission)
    }
}

/**
 * Check for completed missions and move them to oldMissions
 */
function checkCompletedMissions() {
    const completedMissions = gs.missions.filter(m => m.isFulfilled())
    
    for (const mission of completedMissions) {
        mission.refreshSuccessState()
        safeRemove(gs.missions, mission)
        gs.oldMissions.push(mission)
        
        // Show modal for completed mission
        showMissionCompleteModal(mission)
    }
}
