/**
 * Keyboard support hook for calculator
 */

import { useEffect } from 'react';

export const useKeyboard = (calculator) => {
  const {
    inputDigit,
    inputDecimal,
    setOperator,
    equals,
    clear,
    backspace,
    percentage
  } = calculator;

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default for calculator keys
      if (/^[0-9\+\-\*\/\.\=\r]$/.test(e.key) || e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
      }
      
      // Number keys
      if (/^[0-9]$/.test(e.key)) {
        inputDigit(e.key);
      }
      
      // Decimal point
      else if (e.key === '.') {
        inputDecimal();
      }
      
      // Operators
      else if (e.key === '+') {
        setOperator('add');
      }
      else if (e.key === '-') {
        setOperator('subtract');
      }
      else if (e.key === '*') {
        setOperator('multiply');
      }
      else if (e.key === '/') {
        setOperator('divide');
      }
      
      // Equals
      else if (e.key === '=' || e.key === 'Enter') {
        equals();
      }
      
      // Clear
      else if (e.key === 'Escape') {
        clear();
      }
      
      // Backspace
      else if (e.key === 'Backspace') {
        backspace();
      }
      
      // Percentage
      else if (e.key === '%') {
        percentage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, setOperator, equals, clear, backspace, percentage]);
};
