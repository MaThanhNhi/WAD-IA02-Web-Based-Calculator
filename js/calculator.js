/**
 * Windows 11 Basic Mode Calculator - Core Logic Engine
 * 
 * This module implements the calculator's core arithmetic engine following
 * the Immediate Execution Model (left-to-right evaluation) as per Windows 11
 * Basic Mode specifications.
 * 
 * Key Features:
 * - Immediate execution (no operator precedence)
 * - Context-dependent percentage calculations
 * - IEEE 754 double-precision arithmetic
 * - 16 significant digit display limit
 */

class CalculatorEngine {
    constructor() {
        // Core state variables
        this.accumulator = 0;              // Stores result of previous operations
        this.currentInput = '0';           // Current number being entered (as string)
        this.pendingOperator = null;       // Operation waiting to be executed
        this.calculationHistory = '';      // Display string for history
        this.waitingForNewValue = false;   // Flag for operator chaining
        this.lastOperation = null;         // For equals repetition
        this.lastOperand = null;           // For equals repetition
        this.isError = false;              // Error state flag
        
        // History tracking for History Panel
        this.completedCalculations = [];   // Array of completed calculations
        
        // Constants
        this.MAX_DISPLAY_DIGITS = 16;
        this.MAX_INPUT_LENGTH = 16;
        this.MAX_HISTORY_ITEMS = 50;       // Maximum history items to store
    }

    /**
     * Reset calculator to initial state (C button)
     */
    clear() {
        this.accumulator = 0;
        this.currentInput = '0';
        this.pendingOperator = null;
        this.calculationHistory = '';
        this.waitingForNewValue = false;
        this.lastOperation = null;
        this.lastOperand = null;
        this.isError = false;
    }

    /**
     * Clear current entry only (CE button)
     */
    clearEntry() {
        this.currentInput = '0';
        this.isError = false;
    }

    /**
     * Delete last character from current input (Backspace)
     */
    backspace() {
        if (this.waitingForNewValue || this.isError) {
            return;
        }
        
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
    }

    /**
     * Append digit to current input
     * @param {string} digit - The digit to append (0-9)
     */
    inputDigit(digit) {
        if (this.isError) {
            this.clear();
        }
        
        if (this.waitingForNewValue) {
            this.currentInput = digit;
            this.waitingForNewValue = false;
        } else {
            if (this.currentInput === '0') {
                this.currentInput = digit;
            } else if (this.currentInput.length < this.MAX_INPUT_LENGTH) {
                this.currentInput += digit;
            }
        }
    }

    /**
     * Input decimal point
     */
    inputDecimal() {
        if (this.isError) {
            this.clear();
        }
        
        if (this.waitingForNewValue) {
            this.currentInput = '0.';
            this.waitingForNewValue = false;
        } else if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
    }

    /**
     * Toggle sign of current input (± button)
     */
    negate() {
        if (this.isError) {
            return;
        }
        
        const value = parseFloat(this.currentInput);
        this.currentInput = (-value).toString();
    }

    /**
     * Calculate percentage based on context
     * Addition/Subtraction: A ± B% = A ± (A × B/100)
     * Multiplication/Division: A × B% = A × (B/100)
     */
    percentage() {
        if (this.isError) {
            return;
        }
        
        const currentValue = parseFloat(this.currentInput);
        
        if (this.pendingOperator === 'add' || this.pendingOperator === 'subtract') {
            // Context-dependent: percentage of accumulator
            const percentValue = this.accumulator * (currentValue / 100);
            this.currentInput = percentValue.toString();
        } else {
            // Standard: convert to decimal
            this.currentInput = (currentValue / 100).toString();
        }
        
        this.calculationHistory += ` ${currentValue}%`;
    }

    /**
     * Calculate square root of current input
     */
    squareRoot() {
        if (this.isError) {
            this.clear();
        }
        
        const value = parseFloat(this.currentInput);
        
        if (value < 0) {
            this.setError('Invalid input');
            return;
        }
        
        const result = Math.sqrt(value);
        this.calculationHistory = `√(${value})`;
        this.currentInput = this.formatResult(result);
        this.waitingForNewValue = true;
    }

    /**
     * Calculate square of current input
     */
    square() {
        if (this.isError) {
            this.clear();
        }
        
        const value = parseFloat(this.currentInput);
        const result = value * value;
        this.calculationHistory = `sqr(${value})`;
        this.currentInput = this.formatResult(result);
        this.waitingForNewValue = true;
    }

    /**
     * Calculate reciprocal (1/x)
     */
    reciprocal() {
        if (this.isError) {
            this.clear();
        }
        
        const value = parseFloat(this.currentInput);
        
        if (value === 0) {
            this.setError('Cannot divide by zero');
            return;
        }
        
        const result = 1 / value;
        this.calculationHistory = `1/(${value})`;
        this.currentInput = this.formatResult(result);
        this.waitingForNewValue = true;
    }    /**
     * Set operator and execute pending operation (Immediate Execution Model)
     * @param {string} operator - The operator to set ('add', 'subtract', 'multiply', 'divide')
     */
    setOperator(operator) {
        if (this.isError) {
            return;
        }
        
        const currentValue = parseFloat(this.currentInput);
        
        // If there's a pending operation, execute it first (immediate execution)
        if (this.pendingOperator !== null && !this.waitingForNewValue) {
            // Build expression for history BEFORE executing
            const operatorSymbol = this.getOperatorSymbol(this.pendingOperator);
            const expression = `${this.accumulator} ${operatorSymbol} ${currentValue} =`;
            
            // Execute the calculation
            this.executePendingOperation();
            
            // Add to history panel (Windows 11 behavior: add after every calculation)
            if (this.currentInput !== 'Error') {
                this.addToHistory(expression, this.currentInput);
            }
        } else {
            this.accumulator = currentValue;
        }
        
        // Update history display (top small text)
        const operatorSymbol = this.getOperatorSymbol(operator);
        this.calculationHistory = `${this.accumulator} ${operatorSymbol}`;
        
        this.pendingOperator = operator;
        this.waitingForNewValue = true;
        this.lastOperation = operator;
        this.lastOperand = null;
    }    /**
     * Execute the equals operation
     */
    equals() {
        if (this.isError) {
            return;
        }
        
        const currentValue = parseFloat(this.currentInput);
        
        // Clear the history display IMMEDIATELY (Windows 11 behavior)
        this.calculationHistory = '';
        
        // Handle repeated equals (use last operation and operand)
        if (this.waitingForNewValue && this.lastOperation && this.lastOperand !== null) {
            const operatorSymbol = this.getOperatorSymbol(this.lastOperation);
            const expression = `${this.accumulator} ${operatorSymbol} ${this.lastOperand} =`;
            this.accumulator = parseFloat(this.currentInput);
            this.currentInput = this.performOperation(this.accumulator, this.lastOperand, this.lastOperation);
            
            // Add to history for repeated equals
            if (this.currentInput !== 'Error') {
                this.addToHistory(expression, this.currentInput);
            }
        } else if (this.pendingOperator !== null) {
            // There's still a pending operation (user pressed = without chaining)
            const operatorSymbol = this.getOperatorSymbol(this.pendingOperator);
            const expression = `${this.accumulator} ${operatorSymbol} ${currentValue} =`;
            this.lastOperand = currentValue;
            this.executePendingOperation();
            
            // Add to history only if not already added
            if (this.currentInput !== 'Error') {
                this.addToHistory(expression, this.currentInput);
            }
        }
        // If waitingForNewValue is true and no pending operator, 
        // it means calculation was already completed and added to history
        
        this.waitingForNewValue = true;
    }

    /**
     * Execute pending operation (Immediate Execution)
     */
    executePendingOperation() {
        const currentValue = parseFloat(this.currentInput);
        const result = this.performOperation(this.accumulator, currentValue, this.pendingOperator);
        
        this.currentInput = result;
        this.accumulator = parseFloat(result);
        this.pendingOperator = null;
    }

    /**
     * Perform arithmetic operation
     * @param {number} a - First operand
     * @param {number} b - Second operand
     * @param {string} operator - Operation to perform
     * @returns {string} Result as formatted string
     */
    performOperation(a, b, operator) {
        let result;
        
        switch (operator) {
            case 'add':
                result = a + b;
                break;
            case 'subtract':
                result = a - b;
                break;
            case 'multiply':
                result = a * b;
                break;
            case 'divide':
                if (b === 0) {
                    this.setError('Cannot divide by zero');
                    return '0';
                }
                result = a / b;
                break;
            default:
                return a.toString();
        }
        
        return this.formatResult(result);
    }

    /**
     * Format result for display (handle precision and scientific notation)
     * @param {number} value - The value to format
     * @returns {string} Formatted string
     */
    formatResult(value) {
        // Check for special values
        if (!isFinite(value)) {
            this.setError('Result is undefined');
            return '0';
        }
        
        // Handle very small numbers
        if (Math.abs(value) < 1e-10 && value !== 0) {
            return '0';
        }
        
        // Convert to string with appropriate precision
        let result = value.toString();
        
        // Handle scientific notation for very large/small numbers
        if (Math.abs(value) > 1e15 || (Math.abs(value) < 1e-6 && value !== 0)) {
            result = value.toExponential(10);
        } else if (result.length > this.MAX_DISPLAY_DIGITS) {
            // Limit to 16 significant digits
            const numValue = parseFloat(value.toPrecision(this.MAX_DISPLAY_DIGITS));
            result = numValue.toString();
        }
        
        return result;
    }

    /**
     * Set error state
     * @param {string} message - Error message
     */
    setError(message) {
        this.isError = true;
        this.currentInput = message;
        this.calculationHistory = '';
    }

    /**
     * Get operator symbol for display
     * @param {string} operator - Operator name
     * @returns {string} Operator symbol
     */
    getOperatorSymbol(operator) {
        const symbols = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷'
        };
        return symbols[operator] || '';
    }

    /**
     * Get current display value
     * @returns {string} Current display value
     */
    getDisplayValue() {
        return this.currentInput;
    }

    /**
     * Get history display value
     * @returns {string} History display value
     */
    getHistoryValue() {
        return this.calculationHistory;
    }

    /**
     * Check if in error state
     * @returns {boolean} True if in error state
     */
    hasError() {
        return this.isError;
    }
    
    /**
     * Add calculation to history
     * @param {string} expression - The calculation expression (e.g., "5 + 3 =")
     * @param {string} result - The result of the calculation
     */
    addToHistory(expression, result) {
        const historyItem = {
            id: Date.now(),
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleString()
        };
        
        // Add to beginning of array (most recent first)
        this.completedCalculations.unshift(historyItem);
        
        // Limit history size
        if (this.completedCalculations.length > this.MAX_HISTORY_ITEMS) {
            this.completedCalculations.pop();
        }
        
        // Save to localStorage
        this.saveHistoryToLocalStorage();
    }
    
    /**
     * Get all completed calculations
     * @returns {Array} Array of calculation history items
     */
    getCompletedCalculations() {
        return this.completedCalculations;
    }
    
    /**
     * Clear all calculation history
     */
    clearHistory() {
        this.completedCalculations = [];
        this.saveHistoryToLocalStorage();
    }
    
    /**
     * Save history to localStorage
     */
    saveHistoryToLocalStorage() {
        try {
            localStorage.setItem('calculator-history', JSON.stringify(this.completedCalculations));
        } catch (e) {
            console.warn('Failed to save history to localStorage:', e);
        }
    }
    
    /**
     * Load history from localStorage
     */
    loadHistoryFromLocalStorage() {
        try {
            const saved = localStorage.getItem('calculator-history');
            if (saved) {
                this.completedCalculations = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load history from localStorage:', e);
            this.completedCalculations = [];
        }
    }
}

// Export for use in UI module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculatorEngine;
}
