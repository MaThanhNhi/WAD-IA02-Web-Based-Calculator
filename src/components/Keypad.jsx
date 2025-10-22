/**
 * Calculator Keypad Component
 */

import { memo } from 'react';
import Button from './Button';

const BackspaceIcon = () => (
  <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.121-.879l-4.415-4.414a1 1 0 010-1.414l4.415-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z" clipRule="evenodd"/>
  </svg>
);

const Keypad = memo(({ calculator }) => {
  const {
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
    equals
  } = calculator;  return (
    <div className="p-4 bg-calc-calc-bg">
      <div className="grid grid-cols-4 gap-1">
        
        {/* Row 1: Memory and Clear Functions */}
        <Button variant="function" onClick={percentage} ariaLabel="Percent">%</Button>
        <Button variant="function" onClick={clearEntry} ariaLabel="Clear entry">CE</Button>
        <Button variant="function" onClick={clear} ariaLabel="Clear all">C</Button>
        <Button variant="function" onClick={backspace} ariaLabel="Backspace">
          <BackspaceIcon />
        </Button>
        
        {/* Row 2: Advanced Functions and Division */}
        <Button variant="function" onClick={reciprocal} ariaLabel="Reciprocal">1/x</Button>
        <Button variant="function" onClick={square} ariaLabel="Square">x²</Button>
        <Button variant="function" onClick={squareRoot} ariaLabel="Square root">√</Button>
        <Button variant="operator" onClick={() => setOperator('divide')} ariaLabel="Divide">÷</Button>
        
        {/* Row 3: 7, 8, 9, Multiply */}
        <Button variant="number" onClick={() => inputDigit('7')} ariaLabel="Number 7">7</Button>
        <Button variant="number" onClick={() => inputDigit('8')} ariaLabel="Number 8">8</Button>
        <Button variant="number" onClick={() => inputDigit('9')} ariaLabel="Number 9">9</Button>
        <Button variant="operator" onClick={() => setOperator('multiply')} ariaLabel="Multiply">×</Button>
        
        {/* Row 4: 4, 5, 6, Subtract */}
        <Button variant="number" onClick={() => inputDigit('4')} ariaLabel="Number 4">4</Button>
        <Button variant="number" onClick={() => inputDigit('5')} ariaLabel="Number 5">5</Button>
        <Button variant="number" onClick={() => inputDigit('6')} ariaLabel="Number 6">6</Button>
        <Button variant="operator" onClick={() => setOperator('subtract')} ariaLabel="Subtract">−</Button>
        
        {/* Row 5: 1, 2, 3, Add */}
        <Button variant="number" onClick={() => inputDigit('1')} ariaLabel="Number 1">1</Button>
        <Button variant="number" onClick={() => inputDigit('2')} ariaLabel="Number 2">2</Button>
        <Button variant="number" onClick={() => inputDigit('3')} ariaLabel="Number 3">3</Button>
        <Button variant="operator" onClick={() => setOperator('add')} ariaLabel="Add">+</Button>
        
        {/* Row 6: Negate, 0, Decimal, Equals */}
        <Button variant="number" onClick={negate} ariaLabel="Negate">±</Button>
        <Button variant="number" onClick={() => inputDigit('0')} ariaLabel="Number 0">0</Button>
        <Button variant="number" onClick={inputDecimal} ariaLabel="Decimal point">.</Button>
        <Button variant="equals" onClick={equals} ariaLabel="Equals">=</Button>
        
      </div>
    </div>
  );
});

Keypad.displayName = 'Keypad';

export default Keypad;
