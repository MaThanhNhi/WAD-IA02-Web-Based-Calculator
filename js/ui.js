/**
 * Windows 11 Basic Mode Calculator - UI Controller
 * 
 * This module handles all user interface interactions and connects the
 * calculator logic engine to the DOM elements.
 * 
 * Responsibilities:
 * - Event listener management (clicks and keyboard)
 * - Display updates
 * - UI state management
 * - Accessibility features
 * - Dark/Light theme toggle
 */

// Initialize calculator engine
const calculator = new CalculatorEngine();

// DOM elements
const mainDisplay = document.getElementById('main-display');
const historyDisplay = document.getElementById('history-display');
const calculatorElement = document.getElementById('calculator');
const themeToggle = document.getElementById('theme-toggle');

// History Panel DOM elements
const historyPanel = document.getElementById('history-panel');
const historyToggleMobile = document.getElementById('history-toggle-mobile');
const closeHistoryBtn = document.getElementById('close-history');
const clearHistoryBtn = document.getElementById('clear-history');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const historyOverlay = document.getElementById('history-overlay');

// History panel state
let isHistoryPanelOpen = false;
let isMobileView = false;

/**
 * Check if current viewport is mobile/tablet
 */
function checkMobileView() {
    // Check if screen width is less than 1024px (lg breakpoint)
    return window.innerWidth < 1024;
}

/**
 * Theme Management
 */
function initializeTheme() {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('calculator-theme') || 'dark';
    
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('calculator-theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('calculator-theme', 'dark');
    }
}


/**
 * Update display based on calculator state
 */
function updateDisplay() {
    const displayValue = calculator.getDisplayValue();
    const historyValue = calculator.getHistoryValue();
    
    // Update main display
    mainDisplay.textContent = displayValue;
    
    // Update history display
    historyDisplay.textContent = historyValue || '\u00a0'; // Non-breaking space if empty
    
    // Update history panel in real-time (always, regardless of visibility)
    // This ensures the panel shows current data when opened
    updateHistoryPanel();
    
    // Handle error state styling
    if (calculator.hasError()) {
        calculatorElement.classList.add('error-state');
    } else {
        calculatorElement.classList.remove('error-state');
    }
}

/**
 * Toggle history panel visibility
 */
function toggleHistoryPanel() {
    isMobileView = checkMobileView();
    
    if (isMobileView) {
        // Mobile/Tablet behavior: Toggle overlay panel
        isHistoryPanelOpen = !isHistoryPanelOpen;
        
        if (isHistoryPanelOpen) {
            historyPanel.classList.remove('hidden');
            historyPanel.classList.remove('translate-x-full');
            historyOverlay.classList.remove('hidden');
            updateHistoryPanel();
        } else {
            historyPanel.classList.add('translate-x-full');
            historyOverlay.classList.add('hidden');
            setTimeout(() => {
                historyPanel.classList.add('hidden');
            }, 300); // Wait for animation to complete
        }
    } else {
        // Desktop behavior: Always visible, no toggle needed
        historyPanel.classList.remove('hidden');
        updateHistoryPanel();
    }
}

/**
 * Initialize history panel visibility based on screen size
 */
function initializeHistoryPanel() {
    isMobileView = checkMobileView();
    
    if (isMobileView) {
        // Mobile: Hide by default
        historyPanel.classList.add('hidden');
        historyPanel.classList.add('translate-x-full');
        historyOverlay.classList.add('hidden');
    } else {
        // Desktop: Show by default
        historyPanel.classList.remove('hidden');
        historyPanel.classList.remove('translate-x-full');
        updateHistoryPanel();
    }
}

/**
 * Handle window resize
 */
function handleResize() {
    const wasMobile = isMobileView;
    isMobileView = checkMobileView();
    
    // If switching from mobile to desktop
    if (wasMobile && !isMobileView) {
        historyPanel.classList.remove('hidden');
        historyPanel.classList.remove('translate-x-full');
        historyOverlay.classList.add('hidden');
        isHistoryPanelOpen = false;
    }
    // If switching from desktop to mobile
    else if (!wasMobile && isMobileView) {
        historyPanel.classList.add('hidden');
        historyPanel.classList.add('translate-x-full');
        historyOverlay.classList.add('hidden');
        isHistoryPanelOpen = false;
    }
}

/**
 * Update history panel content
 */
function updateHistoryPanel() {
    const calculations = calculator.getCompletedCalculations();
    
    if (calculations.length === 0) {
        historyEmpty.classList.remove('hidden');
        // Remove all history items except empty state
        const items = historyList.querySelectorAll('.history-item');
        items.forEach(item => item.remove());
    } else {
        historyEmpty.classList.add('hidden');
        renderHistoryItems(calculations);
    }
}

/**
 * Render history items in the panel
 * @param {Array} calculations - Array of calculation objects
 */
function renderHistoryItems(calculations) {
    // Get existing items to compare
    const existingItems = historyList.querySelectorAll('.history-item');
    const existingIds = new Set(Array.from(existingItems).map(item => item.getAttribute('data-id')));
    
    // Check if there are new items
    const hasNewItems = calculations.some(calc => !existingIds.has(calc.id.toString()));
    
    // If there are new items, apply slide-down animation to existing items
    if (hasNewItems && existingItems.length > 0) {
        existingItems.forEach(item => {
            item.classList.remove('history-item-new');
            item.classList.add('history-item-slide');
        });
    }
    
    // Clear existing items after a brief moment (to allow animation to start)
    setTimeout(() => {
        const itemsToRemove = historyList.querySelectorAll('.history-item');
        itemsToRemove.forEach(item => item.remove());
        
        // Render each calculation (reverse order to show newest first)
        calculations.slice().reverse().forEach((calc, index) => {
            const itemDiv = document.createElement('div');
            // Base classes with rounded corners and transparent background
            itemDiv.className = 'history-item p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200';
            itemDiv.setAttribute('data-id', calc.id);
            
            // Apply new item animation only to the first (newest) item if there were existing items
            if (index === 0 && hasNewItems && existingIds.size > 0) {
                itemDiv.classList.add('history-item-new');
            }
            
            itemDiv.innerHTML = `
                <div class="text-xs text-win11-text-secondary dark:text-win11-dark-text-secondary mb-1">
                    ${calc.expression}
                </div>
                <div class="text-2xl font-light text-win11-text dark:text-win11-dark-text text-right">
                    ${calc.result}
                </div>
            `;
              // Click handler to use the result
            itemDiv.addEventListener('click', () => {
                calculator.currentInput = calc.result;
                calculator.waitingForNewValue = true;
                updateDisplay();
                
                // Close panel if on mobile
                if (checkMobileView()) {
                    toggleHistoryPanel();
                }
            });
            
            historyList.appendChild(itemDiv);
        });
        
        // Smooth scroll to top if new items were added
        if (hasNewItems && calculations.length > 0) {
            // Use requestAnimationFrame for smooth scrolling
            requestAnimationFrame(() => {
                historyList.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }, hasNewItems && existingItems.length > 0 ? 50 : 0);
}

/**
 * Clear all history
 */
function clearHistory() {
    if (confirm('Clear all history?')) {
        calculator.clearHistory();
        updateHistoryPanel();
    }
}

/**
 * Handle number button clicks
 * @param {string} digit - The digit clicked
 */
function handleNumberClick(digit) {
    calculator.inputDigit(digit);
    updateDisplay();
}

/**
 * Handle decimal button click
 */
function handleDecimalClick() {
    calculator.inputDecimal();
    updateDisplay();
}

/**
 * Handle operator button clicks
 * @param {string} operator - The operator to apply
 */
function handleOperatorClick(operator) {
    calculator.setOperator(operator);
    updateDisplay();
}

/**
 * Handle equals button click
 */
function handleEqualsClick() {
    calculator.equals();
    updateDisplay();
}

/**
 * Handle clear button click (C)
 */
function handleClearClick() {
    calculator.clear();
    updateDisplay();
}

/**
 * Handle clear entry button click (CE)
 */
function handleClearEntryClick() {
    calculator.clearEntry();
    updateDisplay();
}

/**
 * Handle backspace button click
 */
function handleBackspaceClick() {
    calculator.backspace();
    updateDisplay();
}

/**
 * Handle negate button click (±)
 */
function handleNegateClick() {
    calculator.negate();
    updateDisplay();
}

/**
 * Handle percentage button click (%)
 */
function handlePercentageClick() {
    calculator.percentage();
    updateDisplay();
}

/**
 * Handle square root button click (√)
 */
function handleSquareRootClick() {
    calculator.squareRoot();
    updateDisplay();
}

/**
 * Handle square button click (x²)
 */
function handleSquareClick() {
    calculator.square();
    updateDisplay();
}

/**
 * Handle reciprocal button click (1/x)
 */
function handleReciprocalClick() {
    calculator.reciprocal();
    updateDisplay();
}

/**
 * Initialize event listeners for buttons
 */
function initializeButtonListeners() {
    // Theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // History panel buttons
    if (historyToggleMobile) {
        historyToggleMobile.addEventListener('click', toggleHistoryPanel);
    }
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', toggleHistoryPanel);
    }
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }
    if (historyOverlay) {
        historyOverlay.addEventListener('click', toggleHistoryPanel);
    }
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Number buttons
    document.querySelectorAll('.btn-number[data-number]').forEach(button => {
        button.addEventListener('click', (e) => {
            const digit = e.currentTarget.getAttribute('data-number');
            handleNumberClick(digit);
        });
    });
    
    // Action buttons
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.getAttribute('data-action');
            
            switch (action) {
                case 'decimal':
                    handleDecimalClick();
                    break;
                case 'add':
                    handleOperatorClick('add');
                    break;
                case 'subtract':
                    handleOperatorClick('subtract');
                    break;
                case 'multiply':
                    handleOperatorClick('multiply');
                    break;
                case 'divide':
                    handleOperatorClick('divide');
                    break;
                case 'equals':
                    handleEqualsClick();
                    break;
                case 'clear':
                    handleClearClick();
                    break;
                case 'clear-entry':
                    handleClearEntryClick();
                    break;
                case 'backspace':
                    handleBackspaceClick();
                    break;
                case 'negate':
                    handleNegateClick();
                    break;
                case 'percent':
                    handlePercentageClick();
                    break;
                case 'sqrt':
                    handleSquareRootClick();
                    break;
                case 'square':
                    handleSquareClick();
                    break;
                case 'reciprocal':
                    handleReciprocalClick();
                    break;
            }
        });
    });
}

/**
 * Initialize keyboard event listeners
 */
function initializeKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
        // Prevent default for calculator keys
        if (/^[0-9\+\-\*\/\.\=\r]$/.test(e.key) || e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace') {
            e.preventDefault();
        }
        
        // Number keys
        if (/^[0-9]$/.test(e.key)) {
            handleNumberClick(e.key);
            highlightButton(`[data-number="${e.key}"]`);
        }
        
        // Decimal point
        else if (e.key === '.') {
            handleDecimalClick();
            highlightButton('[data-action="decimal"]');
        }
        
        // Operators
        else if (e.key === '+') {
            handleOperatorClick('add');
            highlightButton('[data-action="add"]');
        }
        else if (e.key === '-') {
            handleOperatorClick('subtract');
            highlightButton('[data-action="subtract"]');
        }
        else if (e.key === '*') {
            handleOperatorClick('multiply');
            highlightButton('[data-action="multiply"]');
        }
        else if (e.key === '/') {
            handleOperatorClick('divide');
            highlightButton('[data-action="divide"]');
        }
        
        // Equals
        else if (e.key === '=' || e.key === 'Enter') {
            handleEqualsClick();
            highlightButton('[data-action="equals"]');
        }
        
        // Clear
        else if (e.key === 'Escape') {
            handleClearClick();
            highlightButton('[data-action="clear"]');
        }
        
        // Backspace
        else if (e.key === 'Backspace') {
            handleBackspaceClick();
            highlightButton('[data-action="backspace"]');
        }
        
        // Percentage
        else if (e.key === '%') {
            handlePercentageClick();
            highlightButton('[data-action="percent"]');
        }
    });
}

/**
 * Highlight button when keyboard is used
 * @param {string} selector - CSS selector for button
 */
function highlightButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
        button.classList.add('active:scale-95');
        setTimeout(() => {
            button.classList.remove('active:scale-95');
        }, 100);
    }
}

/**
 * Add visual feedback for button presses
 */
function initializeButtonFeedback() {
    document.querySelectorAll('.calc-btn').forEach(button => {
        button.addEventListener('mousedown', (e) => {
            e.currentTarget.style.transform = 'scale(0.97)';
        });
        
        button.addEventListener('mouseup', (e) => {
            e.currentTarget.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.transform = 'scale(1)';
        });
    });
}

/**
 * Add touch feedback for mobile devices
 */
function initializeTouchFeedback() {
    document.querySelectorAll('.calc-btn').forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.currentTarget.style.transform = 'scale(0.97)';
        }, { passive: true });
        
        button.addEventListener('touchend', (e) => {
            setTimeout(() => {
                e.currentTarget.style.transform = 'scale(1)';
            }, 100);
        }, { passive: true });
    });
}

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
    // Add ARIA labels to buttons
    document.querySelectorAll('.calc-btn').forEach(button => {
        const number = button.getAttribute('data-number');
        const action = button.getAttribute('data-action');
        
        if (number) {
            button.setAttribute('aria-label', `Number ${number}`);
        } else if (action) {
            const labels = {
                'decimal': 'Decimal point',
                'add': 'Add',
                'subtract': 'Subtract',
                'multiply': 'Multiply',
                'divide': 'Divide',
                'equals': 'Equals',
                'clear': 'Clear all',
                'clear-entry': 'Clear entry',
                'backspace': 'Backspace',
                'negate': 'Negate',
                'percent': 'Percent',
                'sqrt': 'Square root',
                'square': 'Square',
                'reciprocal': 'Reciprocal'
            };
            button.setAttribute('aria-label', labels[action] || action);
        }
    });
    
    // Add ARIA live region for display
    mainDisplay.setAttribute('aria-live', 'polite');
    mainDisplay.setAttribute('aria-atomic', 'true');
    historyDisplay.setAttribute('aria-live', 'polite');
    historyDisplay.setAttribute('aria-atomic', 'true');
}

/**
 * Initialize calculator UI
 */
function initialize() {
    // Initialize theme first
    initializeTheme();
    
    // Load saved history from localStorage
    calculator.loadHistoryFromLocalStorage();
    
    // Initialize history panel visibility
    initializeHistoryPanel();
    
    // Set up event listeners
    initializeButtonListeners();
    initializeKeyboardListeners();
    initializeButtonFeedback();
    initializeTouchFeedback();
    initializeAccessibility();
    
    // Initial display update
    updateDisplay();
    
    console.log('Windows 11 Calculator initialized successfully');
    console.log('Theme:', document.documentElement.classList.contains('dark') ? 'Dark' : 'Light');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateDisplay,
        handleNumberClick,
        handleOperatorClick,
        handleEqualsClick
    };
}
