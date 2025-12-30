/**
 * Displays the player's active contracts in a table format.
 */
function showContractsMenu() {
    const contracts = gs.contracts || []
    
    if (contracts.length === 0) {
        showModal('Contracts', 'You have no active contracts.', [
            ['Close', () => closeModal()]
        ])
        return
    }

    // Build contracts table
    const tableRows = [
        ['Type', 'Origin', 'Target', 'Cargo', 'Amount', 'Reward', 'Expires'],
        ...contracts.map(contract => [
            contract.contractType.name,
            coloredName(contract.planet),
            contract.targetPlanet ? coloredName(contract.targetPlanet) : '-',
            contract.cargoType ? contract.cargoType.name : '-',
            contract.amount || '-',
            `${contract.reward}CR`,
            contract.expirationDate ? `${describeDate(contract.expirationDate)}${contract.isExpired ? ' (EXPIRED)' : ''}` : 'No limit'
        ])
    ]

    const contractsTable = createTable(tableRows, null, null)

    showModal(
        'Active Contracts',
        ce({children: [
            `You have ${contracts.length} active contract${contracts.length !== 1 ? 's' : ''}.`,
            contractsTable
        ]}),
        [
            ['Close', () => closeModal()]
        ]
    )
}
