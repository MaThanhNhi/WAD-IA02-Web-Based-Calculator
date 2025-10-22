import { useState } from 'react';
import { useCalculator } from '../hooks/useCalculator';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../hooks/useResponsive';
import { useKeyboard } from '../hooks/useKeyboard';
import Display from './Display';
import Keypad from './Keypad';
import HistoryPanel from './HistoryPanel';

const MenuIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
  </svg>
);

const Calculator = () => {
  const calculator = useCalculator();
  useTheme(); // Apply dark theme permanently
  const { isMobile } = useResponsive();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Enable keyboard support
  useKeyboard(calculator);

  const toggleHistory = () => {
    setIsHistoryOpen(prev => !prev);
  };
  const {
    currentInput,
    calculationHistory,
    isError,
    completedCalculations,
    formatDisplay,
    clearHistory,
    useHistoryResult
  } = calculator;return (
    <div className="bg-calc-bg min-h-screen flex items-center justify-center p-4 font-family-segoe">
      
      {/* Main Calculator Container - Fixed height */}
      <div 
        className={`bg-calc-calc-bg rounded-lg shadow-2xl overflow-hidden ${
          isError ? 'error-state' : ''
        } ${
          isMobile ? 'w-full max-w-md h-auto' : 'w-full max-w-6xl h-[560px]'
        }`}
      >
        
        {/* Calculator Header */}
        <div className="bg-calc-display-bg px-4 py-3 border-b border-calc-border flex justify-between items-center">
          <h1 className="text-sm font-semibold text-calc-text">
            Calculator
          </h1>
          {/* History Toggle Button (Only visible on mobile/tablet) */}
          {isMobile && (
            <button 
              className="p-2 rounded hover:bg-calc-btn-hover transition-colors duration-200" 
              onClick={toggleHistory}
              aria-label="Toggle history panel"
            >
              <MenuIcon />
            </button>
          )}
        </div>        
        {/* Content Container: Calculator Body + History Panel - Full height */}
        <div className="flex flex-col lg:flex-row h-full">
            {/* Calculator Body (Display + Keypad) */}
          <div className="flex-1 flex flex-col">
            <Display 
              currentValue={formatDisplay(currentInput)}
              historyValue={calculationHistory}
              hasError={isError}
            />
            <Keypad calculator={calculator} />
          </div>
          
          {/* History Panel */}
          {(!isMobile || isHistoryOpen) && (
            <HistoryPanel
              completedCalculations={completedCalculations}
              clearHistory={clearHistory}
              useHistoryResult={useHistoryResult}
              isOpen={isHistoryOpen}
              onToggle={toggleHistory}
            />
          )}
          
        </div>
        
      </div>
      
    </div>
  );
};

export default Calculator;
