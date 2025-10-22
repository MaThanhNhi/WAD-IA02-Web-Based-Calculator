/**
 * Calculator Display Component
 */

import { memo } from 'react';

const Display = memo(({ currentValue, historyValue, hasError }) => {
  return (
    <div className="bg-calc-display-bg px-6 py-6">
      {/* History Display */}
      <div 
        className="text-right text-sm text-calc-text-secondary h-6 overflow-hidden transition-opacity duration-200"
        aria-live="polite"
        aria-atomic="true"
      >
        {historyValue || '\u00a0'}
      </div>
        {/* Main Display */}
      <div 
        className={`text-right text-5xl font-light mt-2 overflow-hidden whitespace-nowrap ${
          hasError 
            ? 'display-error' 
            : 'text-calc-text'
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        {currentValue}
      </div>
    </div>
  );
});

Display.displayName = 'Display';

export default Display;
