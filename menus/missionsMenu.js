/**
 * Displays the player's active missions in a table format.
 */
function showMissionsMenu() {
    const missions = gs.missions || []
    
    if (missions.length === 0) {
        showModal('Missions', colorSpan('You have no active missions.', COLORS.Gray), [
            ['Close', () => closeModal()]
        ])
        return
    }

    // Build missions table
    const tableRows = [
        ['Type', 'Description', 'Reward', 'Expires'],
        ...missions.map(mission => [
            mission.missionType.name,
            mission.description || 'No description',
            colorSpan(`${mission.reward}CR`, COLORS.Yellow),
            mission.expirationDate ? `${describeDate(mission.expirationDate)}${mission.isExpired ? colorSpan(' (EXPIRED)', COLORS.Red) : ''}` : 'No limit'
        ])
    ]

    const missionsTable = createTable(tableRows, null, null)

    showModal(
        'Active Missions',
        ce({children: [
            `You have ${missions.length} active mission${missions.length !== 1 ? 's' : ''}.`,
            missionsTable
        ]}),
        [
            ['Close', () => closeModal()]
        ]
    )
}
