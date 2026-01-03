/**
 * A reusable dropdown component.
 * @class Dropdown
 */
class Dropdown {
    // Static property to track currently open dropdown
    static currentlyOpenDropdown = null
    
    /**
     * Creates a new dropdown
     * @param {Array} buttons - Array of button data [label, handler, disabled, classNames]
     * @param {boolean} dropUpwards - Whether dropdown opens upwards
     * @param {number|null} selectedIndex - Initially selected index
     * @param {number|null} maxWidth - Optional maximum width in pixels
     * @param {number} numColumns - Number of columns to display items in
     */
    constructor(buttons = [], dropUpwards = false, selectedIndex = null, maxWidth = null, numColumns = 1) {
        console.log('creating dropdown:',{buttons,dropUpwards,selectedIndex,maxWidth,numColumns})
        this.container = ce()
        if (!buttons || buttons.length === 0) {
            return
        }
        
        this.buttons = buttons
        this.dropUpwards = dropUpwards
        this.maxWidth = maxWidth || 250
        this.numColumns = numColumns
        this.currentSelectedIndex = selectedIndex !== null && !isNaN(selectedIndex) && selectedIndex >= 0 ? selectedIndex : 0
        this.dropdownButtons = []
        this.isOpen = false
        
        this._createElements()
        this._setupEventListeners()
        this._measureAndApplyWidth()

        //setTimeout(() => {
        this.labelElement.style.width = Math.ceil(this.maxWidth)+'px'
        for (const btn of this.dropdownButtons) btn.style.width = `${Math.round(100/this.numColumns)}%`
        //}, 1)
    }
    
    /**
     * Creates the DOM elements for the dropdown
     * @private
     */
    _createElements() {
        const selectedBtnData = this.buttons[this.currentSelectedIndex]
        const [initialLabel] = selectedBtnData
        
        // Create the label element (what shows when dropdown is closed)
        this.labelElement = ce({
            classNames: ['gameButton', 'dropdown-label'],
            innerHTML: initialLabel,
        })
        
        // Create the items container that will be attached to body
        this.itemsContainer = ce({
            classNames: ['dropdown-items']
        })
        
        // Create dropdown items
        this.buttons.forEach((btnData, index) => {
            if (!btnData) return
            
            const [label, handler, disabled, classNames] = btnData
            const btn = ce({
                tag: 'div',
                classNames: ['gameButton'],
                innerHTML: label
            })
            
            // Add custom class names if provided
            if (classNames) {
                if (Array.isArray(classNames)) {
                    classNames.forEach(cn => cn && btn.classList.add(cn))
                } else {
                    btn.classList.add(classNames)
                }
            }
            
            // Disable if it's the currently selected item
            if (index === this.currentSelectedIndex) {
                btn.classList.add('disabled')
            }
            
            // Handle clicks on dropdown items
            btn.onclick = (e) => {
                e.stopPropagation()
                if (!btn.classList.contains('disabled')) {
                    this._updateDropdown(index)
                }
            }
            
            this.dropdownButtons.push(btn)
            this.itemsContainer.appendChild(btn)
        })
        
        // Create the dropdown container (only contains label, items go to body)
        this.container = ce({
            classNames: ['dropdown-container'],
            style: {
                width: Math.ceil(this.maxWidth)+'px'
            },
            children: [this.labelElement]
        })
    }
    
    /**
     * Sets up event listeners
     * @private
     */
    _setupEventListeners() {
        // Toggle dropdown when label is clicked
        this.labelElement.onclick = (e) => {
            e.stopPropagation()
            if (this.isOpen) {
                this._closeDropdown()
            } else {
                this._openDropdown()
            }
        }
        
        // Close dropdown when clicking outside
        this.documentClickHandler = (e) => {
            if (this.isOpen && !this.itemsContainer.contains(e.target) && !this.labelElement.contains(e.target)) {
                this._closeDropdown()
            }
        }
        document.addEventListener('click', this.documentClickHandler)
        
        // Close dropdown on scroll (optional, for better UX)
        this.scrollHandler = () => {
            if (this.isOpen) {
                this._closeDropdown()
            }
        }
        window.addEventListener('scroll', this.scrollHandler, true) // Use capture to catch all scroll events
    }
    
    /**
     * Opens the dropdown and positions it correctly
     * @private
     */
    _openDropdown() {
        // Close any currently open dropdown
        if (Dropdown.currentlyOpenDropdown && Dropdown.currentlyOpenDropdown !== this) {
            Dropdown.currentlyOpenDropdown._closeDropdown()
        }
        
        // Attach items container to body
        document.body.appendChild(this.itemsContainer)
        
        // Calculate position based on label's screen position
        const labelRect = this.labelElement.getBoundingClientRect()
        const itemsHeight = this.itemsContainer.offsetHeight
        
        // Position horizontally aligned with label
        this.itemsContainer.style.left = labelRect.left + 'px'
        this.itemsContainer.style.width = `${Math.round(this.maxWidth*this.numColumns)}px`//labelRect.width + 'px'
        
        // Position vertically (above or below based on dropUpwards setting)
        if (this.dropUpwards) {
            this.itemsContainer.style.top = (labelRect.top - itemsHeight) + 'px'
            this.itemsContainer.style.bottom = 'auto'
        } else {
            this.itemsContainer.style.top = labelRect.bottom + 'px'
            this.itemsContainer.style.bottom = 'auto'
        }
        
        this.itemsContainer.style.display = 'block'
        this.isOpen = true
        
        // Track this as the currently open dropdown
        Dropdown.currentlyOpenDropdown = this
    }
    
    /**
     * Closes the dropdown
     * @private
     */
    _closeDropdown() {
        this.itemsContainer.style.display = 'none'
        if (this.itemsContainer.parentNode === document.body) {
            document.body.removeChild(this.itemsContainer)
        }
        this.isOpen = false
        
        // Clear the currently open dropdown reference if it's this one
        if (Dropdown.currentlyOpenDropdown === this) {
            Dropdown.currentlyOpenDropdown = null
        }
    }
    
    /**
     * Measures buttons and applies consistent width
     * @private
     */
    _measureAndApplyWidth() {
        // Temporarily make container visible to measure
        this.itemsContainer.style.display = 'block'
        this.itemsContainer.style.visibility = 'inline-block'
        this.itemsContainer.style.visibility = 'hidden'
        this.itemsContainer.style.position = 'absolute'
        
        // Add to body temporarily to measure
        document.body.appendChild(this.itemsContainer)
        
        let maxWidth = this.labelElement.offsetWidth
        this.dropdownButtons.forEach(btn => {
            maxWidth = Math.max(maxWidth, btn.offsetWidth)
        })
        
        // Apply max-width constraint if specified
        if (this.maxWidth && maxWidth > this.maxWidth) {
            maxWidth = this.maxWidth
        }
        
        // Apply the width to label and buttons
        this.labelElement.style.width = maxWidth + 'px'
        this.dropdownButtons.forEach(btn => {
            btn.style.width = maxWidth + 'px'
            btn.style.minWidth = maxWidth + 'px'
        })
        
        // Hide the dropdown again and restore fixed positioning
        this.itemsContainer.style.display = 'none'
        this.itemsContainer.style.visibility = 'visible'
        this.itemsContainer.style.position = 'fixed'
    }
    
    /**
     * Updates the dropdown state when a new item is selected
     * @private
     * @param {number} newIndex - The index of the newly selected item
     */
    _updateDropdown(newIndex) {
        this.currentSelectedIndex = newIndex
        const [newLabel, newHandler] = this.buttons[newIndex]
        
        // Update label immediately
        this.labelElement.innerHTML = newLabel
        
        // Update all button states
        this.itemsContainer.childNodes.forEach((btn, index) => {
            if (index === newIndex) {
                btn.classList.add('disabled')
            } else {
                btn.classList.remove('disabled')
            }
        })
        
        // Close dropdown
        this._closeDropdown()
        
        // Call the handler after updating UI (use setTimeout to ensure UI updates first)
        if (newHandler) {
            setTimeout(() => newHandler(), 0)
        }
    }
    
    /**
     * Cleans up event listeners and removes items container
     */
    destroy() {
        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler)
        }
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler, true)
        }
        if (this.itemsContainer.parentNode === document.body) {
            document.body.removeChild(this.itemsContainer)
        }
    }
}