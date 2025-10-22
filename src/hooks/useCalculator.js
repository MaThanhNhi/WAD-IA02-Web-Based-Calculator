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
  
  // NEW STATE: Track the result of the previous function operation
  // This is needed for saving to history when a new function is called
  const [previousFunctionResult, setPreviousFunctionResult] = useState(null);

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
    setPreviousFunctionResult(null);
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
    // start new input BUT preserve accumulator and operation chain for percentage
    if (calculationHistory.includes('=')) {
      setCalculationHistory('');
      setExpressionParts([]);
      setPendingOperator(null);
      setCurrentInput(digit);
      setWaitingForNewValue(false);
      setPreviousFunctionResult(null);
      return;
    }
    
    // CRITICAL FIX: When user types after a function operation,
    // DO NOT clear LAYER 2 (calculationHistory) - keep function expression visible
    // It will only be saved to history when the next function/operator is pressed
    
    // Update LAYER 1 (Main Display) as user types
    if (waitingForNewValue) {
      setCurrentInput(digit);
      setWaitingForNewValue(false);
      // DO NOT clear calculationHistory here - LAYER 2 stays visible
      // DO NOT clear lastFunctionInput here
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
  }, [isError, waitingForNewValue, currentInput, calculationHistory, clear]);  
  
  const inputDecimal = useCallback(() => {
    if (isError) {
      clear();
    }
    
    // If we just completed a calculation (showing result with "=" in history),
    // start fresh with "0." BUT preserve accumulator and operation chain
    if (calculationHistory.includes('=')) {
      setCalculationHistory('');
      setExpressionParts([]);
      setPendingOperator(null);
      setCurrentInput('0.');
      setWaitingForNewValue(false);
      setPreviousFunctionResult(null);
      return;
    }

    // Update LAYER 1 (Main Display) with decimal point
    if (waitingForNewValue) {
      setCurrentInput('0.');
      setWaitingForNewValue(false);
      // DO NOT clear calculationHistory here - LAYER 2 stays visible
      // DO NOT clear lastFunctionInput here
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
    
    // CRITICAL: If there's a function expression in LAYER 2 and user has typed new number,
    // save the previous calculation to LAYER 3 before replacing
    if (calculationHistory && !calculationHistory.includes('=') && pendingOperator === null && !waitingForNewValue && previousFunctionResult !== null) {
      const expression = `${calculationHistory} =`;
      addToHistory(expression, previousFunctionResult);
    }
    
    // Build the new function expression using current input
    const functionExpression = `negate(${currentInput})`;
    
    // Store function expression and result for next operation
    setLastFunctionInput(functionExpression);
    setPreviousFunctionResult(formattedResult);
    
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
    setWaitingForNewValue(true);
  }, [isError, currentInput, clear, formatResult, pendingOperator, getOperatorSymbol, expressionParts, accumulator, calculationHistory, waitingForNewValue, previousFunctionResult, addToHistory]);
    
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

      setAccumulator(parseFloat(formattedResult));
    
      setCurrentInput(formattedResult);
      setCalculationHistory(formattedResult); 
      
      setWaitingForNewValue(true);
      return;
    }
    
    if (pendingOperator === 'add' || pendingOperator === 'subtract') {
      percentValue = accumulator * (currentValue / 100);
      formattedResult = formatResult(percentValue);
      
      // Update LAYER 2 (Expression Display) to show calculated percentage value
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 ? expressionParts.join(' ') : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${formattedResult}`);
    } else if (pendingOperator === 'multiply' || pendingOperator === 'divide') {
      percentValue = currentValue / 100;
      formattedResult = formatResult(percentValue);
      
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 ? expressionParts.join(' ') : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${formattedResult}`);
    }
      setCurrentInput(formattedResult);
    setWaitingForNewValue(false);
    setLastFunctionInput(null);
    setPreviousFunctionResult(null);
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
    
    // CRITICAL: If there's a function expression in LAYER 2 and user has typed new number,
    // save the previous calculation to LAYER 3 before replacing
    if (calculationHistory && !calculationHistory.includes('=') && pendingOperator === null && !waitingForNewValue && previousFunctionResult !== null) {
      const expression = `${calculationHistory} =`;
      addToHistory(expression, previousFunctionResult);
    }
    
    // Build the new function expression using current input
    const functionExpression = `√(${currentInput})`;
    
    // Store function expression and result for next operation
    setLastFunctionInput(functionExpression);
    setPreviousFunctionResult(formattedResult);
    
    // Update LAYER 2 (Expression Display) with function notation
    if (pendingOperator !== null) {
      // Append to pending operation: "9 + √(4)"
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 
        ? expressionParts.join(' ') 
        : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${functionExpression}`);
    } else {
      // Standalone function: "√(9)" or replacing previous
      setCalculationHistory(functionExpression);
    }
    
    // Update LAYER 1 (Main Display) with intermediate result
    setCurrentInput(formattedResult);
    setWaitingForNewValue(true);
  }, [isError, currentInput, clear, formatResult, pendingOperator, getOperatorSymbol, expressionParts, accumulator, calculationHistory, waitingForNewValue, previousFunctionResult, addToHistory]);
    
  const square = useCallback(() => {
    if (isError) {
      clear();
    }
    
    const value = parseFloat(currentInput);
    const result = value * value;
    const formattedResult = formatResult(result);
    
    // CRITICAL: If there's a function expression in LAYER 2 and user has typed new number,
    // save the previous calculation to LAYER 3 before replacing
    if (calculationHistory && !calculationHistory.includes('=') && pendingOperator === null && !waitingForNewValue && previousFunctionResult !== null) {
      // Example: LAYER 2 shows "sqr(5)", user typed "6", now pressing x²
      // Save "sqr(5) = 25" to history
      const expression = `${calculationHistory} =`;
      addToHistory(expression, previousFunctionResult);
    }
    
    // Build the new function expression using current input (not lastFunctionInput)
    const functionExpression = `sqr(${currentInput})`;
    
    // Store function expression and result for next operation
    setLastFunctionInput(functionExpression);
    setPreviousFunctionResult(formattedResult);
    
    // Update LAYER 2 (Expression Display) with function notation
    if (pendingOperator !== null) {
      // Append to pending operation: "5 + sqr(2)"
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 
        ? expressionParts.join(' ') 
        : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${functionExpression}`);
    } else {
      // Standalone function: "sqr(5)" or replacing previous: "sqr(6)"
      setCalculationHistory(functionExpression);
    }
    
    // Update LAYER 1 (Main Display) with intermediate result
    setCurrentInput(formattedResult);
    setWaitingForNewValue(true);
  }, [isError, currentInput, clear, formatResult, pendingOperator, getOperatorSymbol, expressionParts, accumulator, calculationHistory, waitingForNewValue, previousFunctionResult, addToHistory]);
    
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
    
    // CRITICAL: If there's a function expression in LAYER 2 and user has typed new number,
    // save the previous calculation to LAYER 3 before replacing
    if (calculationHistory && !calculationHistory.includes('=') && pendingOperator === null && !waitingForNewValue && previousFunctionResult !== null) {
      const expression = `${calculationHistory} =`;
      addToHistory(expression, previousFunctionResult);
    }
    
    // Build the new function expression using current input
    const functionExpression = `1/(${currentInput})`;
    
    // Store function expression and result for next operation
    setLastFunctionInput(functionExpression);
    setPreviousFunctionResult(formattedResult);
    
    // Update LAYER 2 (Expression Display) with function notation
    if (pendingOperator !== null) {
      // Append to pending operation: "8 + 1/(2)"
      const operatorSymbol = getOperatorSymbol(pendingOperator);
      const baseExpression = expressionParts.length > 0 
        ? expressionParts.join(' ') 
        : accumulator.toString();
      setCalculationHistory(`${baseExpression} ${operatorSymbol} ${functionExpression}`);
    } else {
      // Standalone function: "1/(5)" or replacing previous
      setCalculationHistory(functionExpression);
    }
    
    // Update LAYER 1 (Main Display) with intermediate result
    setCurrentInput(formattedResult);
    setWaitingForNewValue(true);
  }, [isError, currentInput, clear, formatResult, pendingOperator, getOperatorSymbol, expressionParts, accumulator, calculationHistory, waitingForNewValue, previousFunctionResult, addToHistory]);
    
  const setOperator = useCallback((operator) => {
    if (isError) {
      return;
    }
    
    const currentValue = parseFloat(currentInput);
    const operatorSymbol = getOperatorSymbol(operator);
    
    // Clear previous function result when operator is pressed
    setPreviousFunctionResult(null);
    
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
      setLastFunctionInput(null);   
    } else {
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
    
    // Clear previous function result when equals is pressed
    setPreviousFunctionResult(null);
    
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
