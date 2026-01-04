/**
 * Displays a comprehensive cyberware management menu with installed implants and fleet inventory
 * @param {Officer|null} selectedOfficer - The officer whose implants to display (defaults to captain)
 */
function showCyberwareMenu(selectedOfficer = null) {
    const {fleet} = gs
    const officer = selectedOfficer || gs.captain
    const allCrew = [gs.captain, ...fleet.officers]
    
    // Create officer selection dropdown
    const officerOptions = allCrew.map(o => [
        o.name + (o === gs.captain ? ' (Captain)' : ''),
        () => showCyberwareMenu(o)
    ])
    
    const officerDropdown = new Dropdown(
        officerOptions,
        false,
        allCrew.indexOf(officer),
        250
    )
    
    // Installed implants section
    function createInstalledImplantsTable() {
        if (officer.implants.length === 0) {
            return ce({children: [colorSpan('No cybernetic implants installed.', COLORS.Gray)]})
        }
        
        const rows = [
            ['Implant', 'Quality', 'Value', 'Actions']
        ]
        
        for (const implant of officer.implants) {
            rows.push([
                colorSpan(implant.implantType.name, implant.implantType.color),
                statColorSpan(roundToPlaces(implant.quality*100, 1)+'%', implant.quality),
                implant.value + ' CR',
                '→'
            ])
        }
        
        return createTable(rows, (rowIndex) => onSelectInstalledImplant(officer.implants[rowIndex]))
    }
    
    function onSelectInstalledImplant(implant = new CyberImplant()) {
        const buttons = [
            ['Remove', () => {
                showModal(
                    'Remove Implant',
                    `Remove ${colorSpan(implant.implantType.name, implant.implantType.color)} from ${officer.name}?<br/><br/>` +
                    `The implant will be added to your fleet's inventory.`,
                    [
                        ['Confirm', () => {
                            safeRemove(officer.implants, implant)
                            fleet.cyberModules.push(implant)
                            showCyberwareMenu(officer)
                        }],
                        ['Cancel', () => showCyberwareMenu(officer)]
                    ]
                )
            }],
            ['Back', () => showCyberwareMenu(officer)],
        ]
        refreshPanelButtons('cyberware_panel', buttons)
    }
    
    // Fleet inventory section
    function createFleetImplantsTable() {
        if (fleet.cyberModules.length === 0) {
            return ce({children: [colorSpan('No implants in fleet inventory.', COLORS.Gray)]})
        }
        
        const rows = [
            ['Implant', 'Quality', 'Value', 'Actions']
        ]
        
        for (const implant of fleet.cyberModules) {
            rows.push([
                colorSpan(implant.implantType.name, implant.implantType.color),
                statColorSpan(roundToPlaces(implant.quality*100, 1)+'%', implant.quality),
                implant.value + ' CR',
                '→'
            ])
        }
        
        return createTable(rows, (rowIndex) => onSelectFleetImplant(fleet.cyberModules[rowIndex]))
    }
    
    function onSelectFleetImplant(implant = new CyberImplant()) {
        const alreadyHasImplant = officer.implants.some(i => i.implantType === implant.implantType)
        const canInstall = !alreadyHasImplant
        
        let reasonText = alreadyHasImplant ? `${officer.name} already has a ${implant.implantType.name} installed.` : ''
        
        const buttons = [
            ['Install on ' + officer.name, () => {
                safeRemove(fleet.cyberModules, implant)
                officer.implants.push(implant)
                showCyberwareMenu(officer)
            }, !canInstall],
            ['Back', () => showCyberwareMenu(officer)],
        ]
        
        if (reasonText) {
            refreshPanelButtons('cyberware_panel', buttons)
            // Show reason text somewhere - could add a message area
        } else {
            refreshPanelButtons('cyberware_panel', buttons)
        }
    }
    
    // Left column - Installed implants
    const leftColumn = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            ce({children: ['<b><u>Crew Member</u></b>']}),
            officerDropdown.container,
            ce({children: ['<br/><b>Installed Implants</b>']}),
            createInstalledImplantsTable(),
        ]
    })
    
    // Right column - Fleet inventory
    const rightColumn = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            ce({children: ['<b><u>Fleet Inventory</u></b>']}),
            ce({children: [`${fleet.cyberModules.length} implant${fleet.cyberModules.length !== 1 ? 's' : ''} available`]}),
            createFleetImplantsTable(),
        ]
    })
    
    const columnLayout = createColumnLayout([leftColumn, rightColumn])
    
    showModal(
        'Cyberware Management',
        ce({children:[
            columnLayout,
        ],
        style: {
            width: '800px'
        }}),
        [
            ['Close', () => closeModal()],
        ],
        'cyberware_panel'
    )
}
