/**
 * Shows the save/load menu with options
 */
function showSaveLoadMenu() {
    /** @type {ButtonData[]} */
    const buttons = [
        ['Save Game', () => showSaveMenu()],
        ['Load Game', () => showLoadMenu()],
        ['Title Screen', () => handleReturnToTitle()],
        ['Cancel', () => closeModal()]
    ];
    
    showModal('Game Menu', 'Choose an option:', buttons);
}

/**
 * Handles returning to title screen with unsaved progress warning
 */
function handleReturnToTitle() {
    if (!gs.savedThisTick) {
        showModal(
            'Unsaved Progress',
            'You have unsaved progress. Are you sure you want to quit?',
            [
                ['Quit Anyway', () => {
                    closeModal();
                    showTitleScreen();
                }],
                ['Cancel', () => showSaveLoadMenu()]
            ]
        );
    } else {
        closeModal();
        showTitleScreen();
    }
}

/**
 * Creates a text input element
 * @param {string} placeholder - Placeholder text
 * @param {string} defaultValue - Default value
 * @returns {HTMLInputElement}
 */
function createTextInput(placeholder = '', defaultValue = '') {
    /** @type {HTMLInputElement} */
    // @ts-ignore
    const input = ce({tag: 'input'});
    input.type = 'text';
    input.placeholder = placeholder;
    input.value = defaultValue;
    input.style.padding = '8px';
    input.style.marginBottom = '10px';
    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    input.style.fontSize = '14px';
    return input;
}

/**
 * Shows the save menu with list of existing saves
 */
function showSaveMenu() {
    const saveList = SaveManager.getSaveList();
    
    // Sort by most recent timestamp first
    saveList.sort((a, b) => b.timestamp - a.timestamp);
    
    // Create save name input
    const saveNameInput = createTextInput('Enter save name...', 'quicksave');
    
    // Create table of existing saves
    const rows = [
        ['File Name', 'Saved Date', 'Game Year', 'Captain', 'Faction', 'Race']
    ];
    
    for (const save of saveList) {
        const savedDate = new Date(save.timestamp).toLocaleString();
        const gameYear = describeDate(save.year);
        
        // Deserialize faction and race strings to their type objects
        const faction = PLAYER_FACTIONS.find(f => f.name === save.captainFaction)
        const race = Object.values(RACES).find(r => r.name === save.captainRace)
        
        rows.push([
            save.name,
            savedDate,
            gameYear,
            save.captainName,
            coloredName(faction),
            coloredName(race)
        ]);
    }
    
    const table = createTable(rows, (rowIndex) => {
        // When clicking a row, fill the input with that save name
        const save = saveList[rowIndex];
        saveNameInput.value = save.name;
    });
    
    const content = ce({children: [
        'Enter a name for your save or select an existing save to overwrite:',
        ce({tag: 'br'}),
        saveNameInput,
        ce({tag: 'br'}),
        saveList.length > 0 ? table : ce({innerHTML: '<i>No existing saves</i>'})
    ]});
    
    showModal('Save Game', content, [
        ['Save', () => {
            const saveName = saveNameInput.value.trim();
            if (!saveName) {
                showModal('Error', 'Please enter a save name.', [['OK', () => showSaveMenu()]]);
                return;
            }
            
            // Check if overwriting
            const existing = saveList.find(s => s.name === saveName);
            if (existing) {
                showModal(
                    'Overwrite Save?',
                    `A save named "${saveName}" already exists. Overwrite it?`,
                    [
                        ['Overwrite', () => performSave(saveName)],
                        ['Cancel', () => showSaveMenu()]
                    ]
                );
            } else {
                performSave(saveName);
            }
        }],
        ['Cancel', () => showSaveLoadMenu()]
    ]);
}

/**
 * Performs the actual save operation
 * @param {string} saveName
 */
function performSave(saveName) {
    showModal('Saving...', 'Saving your game...', []);
    
    setTimeout(() => {
        const result = SaveManager.saveGame(saveName);
        
        if (result.success) {
            showModal(
                'Game Saved',
                `Your game has been saved as "${saveName}"!<br/>Save size: ${result.size} KB`,
                [['OK', () => closeModal()]]
            );
        } else {
            showModal(
                'Save Failed',
                `Failed to save game: ${result.error}<br/>Please try again.`,
                [['OK', () => showSaveMenu()]]
            );
        }
    }, 100);
}

/**
 * Shows the load menu with list of existing saves
 */
function showLoadMenu() {
    const saveList = SaveManager.getSaveList();
    
    if (saveList.length === 0) {
        showModal('No Saves', 'No saved games found.', [['OK', () => showSaveLoadMenu()]]);
        return;
    }
    
    // Sort by most recent timestamp first
    saveList.sort((a, b) => b.timestamp - a.timestamp);
    
    // Create table of existing saves
    const rows = [
        ['File Name', 'Saved Date', 'Game Year', 'Captain', 'Faction', 'Race']
    ];
    
    for (const save of saveList) {
        const savedDate = new Date(save.timestamp).toLocaleString();
        const gameYear = describeDate(save.year);
        
        // Deserialize faction and race strings to their type objects
        const faction = PLAYER_FACTIONS.find(f => f.name === save.captainFaction);
        const race = Object.values(RACES).find(r => r.name === save.captainRace);
        
        rows.push([
            save.name,
            savedDate,
            gameYear,
            save.captainName,
            coloredName(faction),
            coloredName(race)
        ]);
    }
    
    let selectedIndex = null;
    
    const table = createTable(rows, (rowIndex) => {
        selectedIndex = rowIndex;
    }, 0);
    
    const content = ce({children: [
        'Select a save to load:',
        ce({tag: 'br'}),
        ce({tag: 'br'}),
        table
    ]});
    
    showModal('Load Game', content, [
        ['Load', () => {
            if (selectedIndex === null) {
                showModal('Error', 'Please select a save to load.', [['OK', () => showLoadMenu()]]);
                return;
            }
            
            const save = saveList[selectedIndex];
            
            // Warn about unsaved progress
            if (!gs.savedThisTick) {
                showModal(
                    'Unsaved Progress',
                    'Loading will discard any unsaved progress. Continue?',
                    [
                        ['Load Anyway', () => performLoad(save.name)],
                        ['Cancel', () => showLoadMenu()]
                    ]
                );
            } else {
                performLoad(save.name);
            }
        }],
        ['Delete', () => {
            if (selectedIndex === null) {
                showModal('Error', 'Please select a save to delete.', [['OK', () => showLoadMenu()]]);
                return;
            }
            
            const save = saveList[selectedIndex];
            showModal(
                'Delete Save?',
                `Are you sure you want to delete "${save.name}"? This cannot be undone.`,
                [
                    ['Delete', () => {
                        SaveManager.deleteSave(save.name);
                        showModal('Deleted', `Save "${save.name}" has been deleted.`, [['OK', () => showLoadMenu()]]);
                    }],
                    ['Cancel', () => showLoadMenu()]
                ]
            );
        }],
        ['Cancel', () => showSaveLoadMenu()]
    ]);
}

/**
 * Performs the actual load operation
 * @param {string} saveName
 */
function performLoad(saveName) {
    showModal('Loading...', 'Loading your game...', []);
    
    setTimeout(() => {
        const loadedGs = SaveManager.loadGame(saveName);
        
        if (loadedGs) {
            // Replace global game state
            Object.assign(gs, loadedGs);
            
            // Refresh the map
            if (currentMap) {
                currentMap.refresh();
            }
            
            showModal(
                'Game Loaded',
                `Your game "${saveName}" has been loaded successfully!`,
                [['OK', () => {
                    closeModal();
                    // Show the star map
                    showStarMap();
                }]]
            );
        } else {
            showModal(
                'Load Failed',
                'Failed to load game. The save file may be corrupted.',
                [['OK', () => showLoadMenu()]]
            );
        }
    }, 100);
}
