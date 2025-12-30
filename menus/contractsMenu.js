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
        ['Type', 'Description', 'Reward', 'Expires'],
        ...contracts.map(contract => [
            contract.contractType.name,
            contract.description || 'No description',
            colorSpan(`${contract.reward}CR`, COLORS.Yellow),
            contract.expirationDate ? `${describeDate(contract.expirationDate)}${contract.isExpired ? colorSpan(' (EXPIRED)', COLORS.Red) : ''}` : 'No limit'
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
