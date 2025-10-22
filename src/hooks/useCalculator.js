import { useState, useCallback, useEffect } from 'react';

const MAX_DISPLAY_DIGITS = 16;
const MAX_INPUT_LENGTH = 16;
const MAX_HISTORY_ITEMS = 50;

export const useCalculator = () => {
  const [currentInput, setCurrentInput] = useState('0'); // LAYER 1: MAIN DISPLAY (Center, large text)
  const [calculationHistory, setCalculationHistory] = useState('');  // LAYER 2: EXPRESSION DISPLAY (Top-right, small text)
  const [completedCalculations, setCompletedCalculations] = useState([]);  // LAYER 3: HISTORY PANEL (Right side)
  
  // Core calculator state
  const [accumulator, setAccumulator] = useState(0);
  const [pendingOperator, setPendingOperator] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [lastOperation, setLastOperation] = useState(null);
  const [lastOperand, setLastOperand] = useState(null);
  const [isError, setIsError] = useState(false);
  
  // Expression building state - tracks function notation for nested operations
  const [expressionParts, setExpressionParts] = useState([]);
  const [lastFunctionInput, setLastFunctionInput] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('calculator-history');
      if (saved) {
        setCompletedCalculations(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('calculator-history', JSON.stringify(completedCalculations));
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }
  }, [completedCalculations]);

  // Helper function to format results for display
  const formatResult = useCallback((value) => {
    // Check for special values
    if (!isFinite(value)) {
      return 'Result is undefined';
    }
    
    const rounded = parseFloat(value.toPrecision(15));

    let result = rounded.toString();
    if (Math.abs(rounded) > 1e17 || (Math.abs(rounded) < 1e-17 && rounded !== 0)) {
      result = rounded.toExponential(10);
    } else if (result.length > MAX_DISPLAY_DIGITS) {
      result = parseFloat(rounded.toPrecision(MAX_DISPLAY_DIGITS)).toString();
    }
    
    return result;
  }, []);

  // Helper function to add thousand separators for display
  const formatDisplay = useCallback((value) => {
    if (typeof value === 'string' && (value.includes('Cannot') || value.includes('Invalid') || value.includes('Result is'))) {
      return value;
    }
    
    const strValue = value.toString();
    
    if (strValue.includes('e')) {
      return strValue;
    }
    
    const isNegative = strValue.startsWith('-');
    const absoluteValue = isNegative ? strValue.slice(1) : strValue;
    
    const parts = absoluteValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    const formattedNumber = decimalPart !== undefined 
      ? `${formattedInteger}.${decimalPart}` 
      : formattedInteger;
    
    return isNegative ? `-${formattedNumber}` : formattedNumber;
  }, []);

  // Helper function to get operator symbol
  const getOperatorSymbol = useCallback((operator) => {
    const symbols = {
      'add': '+',
      'subtract': '−',
      'multiply': '×',
      'divide': '÷'
    };
    return symbols[operator] || '';
  }, []);

  // Helper function to perform arithmetic operations
  const performOperation = useCallback((a, b, operator) => {
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
          return 'Cannot divide by zero';
        }
        result = a / b;
        break;
      default:
        return a.toString();
    }
    
    return formatResult(result);
  }, [formatResult]);
  // Add calculation to history
  const addToHistory = useCallback((expression, result) => {
    const historyItem = {
      id: Date.now(),
      expression: expression,
      result: result,
      timestamp: new Date().toLocaleString()
    };
    
    setCompletedCalculations(prev => {
      const newHistory = [historyItem, ...prev];
      // Limit history size
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  // Calculator operations
  const clear = useCallback(() => {
    setAccumulator(0);
    setCurrentInput('0');
    setPendingOperator(null);
    setCalculationHistory('');
    setWaitingForNewValue(false);
    setLastOperation(null);
    setLastOperand(null);
    setIsError(false);
    setExpressionParts([]);
    setLastFunctionInput(null);
  }, []);

  const clearEntry = useCallback(() => {
    setCurrentInput('0');
    setIsError(false);
  }, []);

  const backspace = useCallback(() => {
    if (waitingForNewValue || isError) {
      return;
    }
    
    if (currentInput.length > 1) {
      setCurrentInput(prev => prev.slice(0, -1));
    } else {
      setCurrentInput('0');
    }
  }, [waitingForNewValue, isError, currentInput]);  
  
  const inputDigit = useCallback((digit) => {
    if (isError) {
      clear();
    }
    
    // If we just completed a calculation (showing result with "=" in LAYER 2),
    // start fresh with new number
    if (calculationHistory.includes('=')) {
      setCalculationHistory('');
      setExpressionParts([]);
      setAccumulator(0);
      setPendingOperator(null);
      setLastOperation(null);
      setLastOperand(null);
      setCurrentInput(digit);
      setWaitingForNewValue(false);
      return;
    }
    
    // Update LAYER 1 (Main Display) as user types
    if (waitingForNewValue) {
      setCurrentInput(digit);
      setWaitingForNewValue(false);
    } else {
      if (currentInput === '0') {
        setCurrentInput(digit);
      } else if (currentInput.length < MAX_INPUT_LENGTH) {
        setCurrentInput(prev => prev + digit);
      }
      else if (currentInput.startsWith('0.') && currentInput.length < 18) {
        setCurrentInput(prev => prev + digit);
      }
    }
  }, [isError, waitingForNewValue, currentInput, calculationHistory, clear]);  const inputDecimal = useCallback(() => {
    if (isError) {
      clear();
    }
    
    // If we just completed a calculation (showing result with "=" in history),
    // start fresh with "0."
    if (calculationHistory.includes('=')) {
      setCalculationHistory('');
      setExpressionParts([]);
      setAccumulator(0);
      setPendingOperator(null);
      setLastOperation(null);
      setLastOperand(null);
      setCurrentInput('0.');
      setWaitingForNewValue(false);
      return;
    }
    
    // Update LAYER 1 (Main Display) with decimal point
    if (waitingForNewValue) {
      setCurrentInput('0.');
      setWaitingForNewValue(false);
    } else if (!currentInput.includes('.')) {
      setCurrentInput(prev => prev + '.');
    }
  }, [isError, waitingForNewValue, currentInput, calculationHistory, clear]);  
  
  const negate = useCallback(() => {
    if (isError) {
      clear();
    }
    
    const value = parseFloat(currentInput);
    const result = -value;
    const formattedResult = formatResult(result);
    
    // Build the negate expression wrapper
    // CRITICAL: Use currentInput (original string) to preserve exact value, not value.toString()
    // Use lastFunctionInput if available (for chained functions), otherwise use original input string
    const innerExpression = lastFunctionInput || currentInput;
    const functionExpression = `negate(${innerExpression})`;
    
    // Store function expression for preservation in Layer 2 and Layer 3
    setLastFunctionInput(functionExpression);
    
    // Update LAYER 2 (Expression Display) with function notation
    if (pendingOperator !== null) {
      // Append to pending operation: "9 + negate(5)"
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 
        ? expressionParts.join(' ') 
        : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${functionExpression}`);
    } else {
      // Standalone function: "negate(5)"
      setCalculationHistory(functionExpression);
    }
    
    // Update LAYER 1 (Main Display) with intermediate result
    setCurrentInput(formattedResult);
    setWaitingForNewValue(true);  }, [isError, currentInput, clear, formatResult, lastFunctionInput, pendingOperator, getOperatorSymbol, expressionParts, accumulator]);
    const percentage = useCallback(() => {
    if (isError) {
      return;
    }
    
    const currentValue = parseFloat(currentInput);
    let percentValue;
    let formattedResult;      
    if (pendingOperator === null) {
      percentValue = accumulator * (currentValue / 100);
      formattedResult = formatResult(percentValue);

      setCalculationHistory('');
      setCurrentInput(formattedResult);
      setWaitingForNewValue(true);
      return;
    }
    
    if (pendingOperator === 'add' || pendingOperator === 'subtract') {
      // Addition/Subtraction: Calculate percentage of the base number (accumulator)
      // Formula: A + B% → A + (A * B / 100)
      //          A - B% → A - (A * B / 100)
      percentValue = accumulator * (currentValue / 100);
      formattedResult = formatResult(percentValue);
      
      // Update LAYER 2 (Expression Display) to show calculated percentage value
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 ? expressionParts.join(' ') : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${formattedResult}`);
    } else if (pendingOperator === 'multiply' || pendingOperator === 'divide') {
      // Multiplication/Division: Convert B to decimal (B / 100)
      // Formula: A × B% → A × (B / 100)
      //          A ÷ B% → A ÷ (B / 100)
      percentValue = currentValue / 100;
      formattedResult = formatResult(percentValue);
      
      // Update LAYER 2 (Expression Display)
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 ? expressionParts.join(' ') : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${formattedResult}`);
    }
    
    // Update LAYER 1 (Main Display) with calculated percentage result
    setCurrentInput(formattedResult);
    
    // CRITICAL: Set waitingForNewValue to FALSE so that when next operator is pressed,
    // the pending calculation will execute (enabling chained operations like 72 - 20% + 5%)
    setWaitingForNewValue(false);
    
    // Clear function input since percentage replaces the current input
    setLastFunctionInput(null);
  }, [isError, currentInput, pendingOperator, accumulator, expressionParts, getOperatorSymbol, formatResult]);
  
  const squareRoot = useCallback(() => {
    if (isError) {
      clear();
    }
    
    const value = parseFloat(currentInput);
    
    if (value < 0) {
      setIsError(true);
      setCurrentInput('Invalid input');
      return;
    }
    
    const result = Math.sqrt(value);
    const formattedResult = formatResult(result);
    
    // CRITICAL: Use currentInput (original string) to preserve exact value
    // Use lastFunctionInput if available to preserve notation chain
    // Example: sqr(9) → √ becomes √(sqr(9)), not √(81)
    const innerExpression = lastFunctionInput || currentInput;
    const functionExpression = `√(${innerExpression})`;
    
    // Store function expression for nested operation support (e.g., negate(√(9)))
    setLastFunctionInput(functionExpression);
    
    // Update LAYER 2 (Expression Display) with function notation
    if (pendingOperator !== null) {
      // Append to pending operation: "9 + √(4)"
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 
        ? expressionParts.join(' ') 
        : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${functionExpression}`);
    } else {
      // Standalone function: "√(9)" or chained: "√(sqr(9))"
      setCalculationHistory(functionExpression);
    }
    
    // Update LAYER 1 (Main Display) with intermediate result
    setCurrentInput(formattedResult);
    setWaitingForNewValue(true);
  }, [isError, currentInput, clear, formatResult, lastFunctionInput, pendingOperator, getOperatorSymbol, expressionParts, accumulator]);
  
  const square = useCallback(() => {
    if (isError) {
      clear();
    }
    
    const value = parseFloat(currentInput);
    const result = value * value;
    const formattedResult = formatResult(result);
    
    // CRITICAL: Use currentInput (original string) to preserve exact value
    // Use lastFunctionInput if available to preserve notation chain
    // Example: sqr(9) → x² becomes sqr(sqr(9)), not sqr(81)
    const innerExpression = lastFunctionInput || currentInput;
    const functionExpression = `sqr(${innerExpression})`;
    
    // Store function expression for nested operations
    setLastFunctionInput(functionExpression);
    
    // Update LAYER 2 (Expression Display) with function notation
    if (pendingOperator !== null) {
      // Append to pending operation: "5 + sqr(2)"
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 
        ? expressionParts.join(' ') 
        : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${functionExpression}`);
    } else {
      // Standalone function: "sqr(5)" or chained: "sqr(sqr(9))"
      setCalculationHistory(functionExpression);
    }
    
    // Update LAYER 1 (Main Display) with intermediate result
    setCurrentInput(formattedResult);
    setWaitingForNewValue(true);
  }, [isError, currentInput, clear, formatResult, lastFunctionInput, pendingOperator, getOperatorSymbol, expressionParts, accumulator]);  
  
  const reciprocal = useCallback(() => {
    if (isError) {
      clear();
    }
    
    const value = parseFloat(currentInput);
    
    if (value === 0) {
      setIsError(true);
      setCurrentInput('Cannot divide by zero');
      return;
    }
    
    const result = 1 / value;
    const formattedResult = formatResult(result);
    
    // CRITICAL: Use currentInput (original string) to preserve exact value
    // Use lastFunctionInput if available to preserve notation chain
    // Example: sqr(4) → 1/x becomes 1/(sqr(4)), not 1/(16)
    const innerExpression = lastFunctionInput || currentInput;
    const functionExpression = `1/(${innerExpression})`;
    
    // Store function expression for nested operations
    setLastFunctionInput(functionExpression);
    
    // Update LAYER 2 (Expression Display) with function notation
    if (pendingOperator !== null) {
      // Append to pending operation: "8 + 1/(2)"
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 
        ? expressionParts.join(' ') 
        : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${functionExpression}`);
    } else {
      // Standalone function: "1/(5)" or chained: "1/(sqr(4))"
      setCalculationHistory(functionExpression);
    }
    
    // Update LAYER 1 (Main Display) with intermediate result
    setCurrentInput(formattedResult);
    setWaitingForNewValue(true);
  }, [isError, currentInput, clear, formatResult, lastFunctionInput, pendingOperator, getOperatorSymbol, expressionParts, accumulator]);
  
  const setOperator = useCallback((operator) => {
    if (isError) {
      return;
    }
    
    const currentValue = parseFloat(currentInput);
    const operatorSymbol = getOperatorSymbol(operator);
    
    // SEQUENTIAL EVALUATION: If there's a pending operation, execute it first (left-to-right)
    if (pendingOperator !== null && !waitingForNewValue) {
      // Build expression for LAYER 3 (History Panel) BEFORE executing
      const prevOperatorSymbol = getOperatorSymbol(pendingOperator);
        // Get the base expression (either from expressionParts or accumulator)
      const baseExpression = expressionParts.length > 0 
        ? expressionParts.join(' ') 
        : accumulator.toString();
      
      // CRITICAL: Use original string input to preserve exact value (avoid rounding)
      // Use function notation if available, otherwise use currentInput (the exact string)
      const displayedOperand = lastFunctionInput || currentInput;
      
      const expression = `${baseExpression} ${prevOperatorSymbol} ${displayedOperand} =`;
      
      // Execute the calculation using the ACTUAL numeric value
      const result = performOperation(accumulator, currentValue, pendingOperator);
      
      if (result === 'Cannot divide by zero') {
        setIsError(true);
        setCurrentInput('Cannot divide by zero');
        setCalculationHistory('');
        return;
      }
      
      // Update LAYER 1 (Main Display) with intermediate result
      setCurrentInput(result);
      setAccumulator(parseFloat(result));
      
      // Add to LAYER 3 (History Panel) with function notation preserved
      addToHistory(expression, result);
      
      // Set up new expression with result and new operator for LAYER 2
      setExpressionParts([result]);
      setCalculationHistory(`${result} ${operatorSymbol}`);
      
      // Clear function input since we've used it
      setLastFunctionInput(null);    } else {
      // First operator or after a function
      // CRITICAL: Use original string input to preserve exact value
      // Use function notation if available, otherwise use currentInput (the exact string)
      const baseExpression = lastFunctionInput || currentInput;
      
      setAccumulator(currentValue);
      setExpressionParts([baseExpression]);
      setCalculationHistory(`${baseExpression} ${operatorSymbol}`);
      setLastFunctionInput(null);
    }
    
    setPendingOperator(operator);
    setWaitingForNewValue(true);
    setLastOperation(operator);
    setLastOperand(null);
  }, [isError, currentInput, pendingOperator, waitingForNewValue, accumulator, expressionParts, lastFunctionInput, getOperatorSymbol, performOperation, addToHistory]);  
  
  const equals = useCallback(() => {
    if (isError) {
      return;
    }
    
      // Handle case: just a single number followed by equals (e.g., "5 =")
    if (pendingOperator === null && !calculationHistory.includes('=')) {
      // CRITICAL: Use original string input to preserve exact value
      // Use function notation if available (e.g., "√(9) =" instead of "3 =")
      const displayExpression = lastFunctionInput || currentInput;
      const expression = `${displayExpression} =`;
      setCalculationHistory(expression);
      addToHistory(expression, currentInput);
      setWaitingForNewValue(true);
      setLastFunctionInput(null);
      return;
    }
    
    // Handle repeated equals (use last operation and operand)
    if (waitingForNewValue && lastOperation && lastOperand !== null) {
      const operatorSymbol = getOperatorSymbol(lastOperation);
      
      // Get current expression or build from accumulator
      const baseExpression = calculationHistory && !calculationHistory.includes('=')
        ? calculationHistory.split(' ')[0]  // Get first part
        : parseFloat(currentInput).toString();
      
      const expression = `${baseExpression} ${operatorSymbol} ${lastOperand} =`;
      
      const result = performOperation(parseFloat(currentInput), lastOperand, lastOperation);
      
      if (result !== 'Cannot divide by zero') {
        // Update LAYER 1 (Main Display) with final result
        setCurrentInput(result);
        setAccumulator(parseFloat(result));
        // Update LAYER 2 (Expression Display) with "=" appended
        setCalculationHistory(expression);
        // Add to LAYER 3 (History Panel)
        addToHistory(expression, result);
      } else {
        setIsError(true);
        setCurrentInput('Cannot divide by zero');
        setCalculationHistory('');
      }
    } else if (pendingOperator !== null) {
      // There's a pending operation - complete it
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      
      // Build the expression showing what was entered
      const baseExpression = expressionParts.length > 0 
        ? expressionParts.join(' ') 
        : accumulator.toString();
      
      // CRITICAL: Use function notation if available, otherwise use currentInput
      const displayedValue = lastFunctionInput || currentInput;
      
      const expression = `${baseExpression} ${operatorSymbol} ${displayedValue} =`;
      
      setLastOperand(parseFloat(currentInput));
      setLastOperation(pendingOperator);
      
      const result = performOperation(accumulator, parseFloat(currentInput), pendingOperator);
      
      if (result !== 'Cannot divide by zero') {
        // Update LAYER 1 (Main Display) with final result
        setCurrentInput(result);
        setAccumulator(parseFloat(result));
        // Update LAYER 2 (Expression Display) with "=" appended
        setCalculationHistory(expression);
        // Add to LAYER 3 (History Panel) with function notation preserved
        addToHistory(expression, result);
      } else {
        setIsError(true);
        setCurrentInput('Cannot divide by zero');
        setCalculationHistory('');
      }
      
      setPendingOperator(null);
      setLastFunctionInput(null);
    }
    
    setWaitingForNewValue(true);
  }, [isError, currentInput, waitingForNewValue, lastOperation, lastOperand, accumulator, pendingOperator, calculationHistory, expressionParts, lastFunctionInput, getOperatorSymbol, performOperation, addToHistory]);

  const clearHistory = useCallback(() => {
    setCompletedCalculations([]);
  }, []);

  const useHistoryResult = useCallback((result) => {
    setCurrentInput(result);
    setWaitingForNewValue(true);
  }, []);
  return {
    // State
    currentInput,
    calculationHistory,
    isError,
    completedCalculations,
    
    // Formatting helper
    formatDisplay,
    
    // Operations
    clear,
    clearEntry,
    backspace,
    inputDigit,
    inputDecimal,
    negate,
    percentage,
    squareRoot,
    square,
    reciprocal,
    setOperator,
    equals,
    clearHistory,
    useHistoryResult
  };
};
