import { memo } from 'react';
import { useResponsive } from '../hooks/useResponsive';

const ClockIcon = () => (
  <svg className="w-16 h-16 mb-4 text-calc-text-secondary" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
  </svg>
);

const HistoryPanel = memo(({ 
  completedCalculations, 
  clearHistory, 
  useHistoryResult, 
  isOpen, 
  onToggle 
}) => {
  const { isMobile } = useResponsive();

  const handleClearHistory = () => {
    if (window.confirm('Clear all history?')) {
      clearHistory();
    }
  };

  const handleHistoryItemClick = (result) => {
    useHistoryResult(result);
    if (isMobile && onToggle) {
      onToggle();
    }
  };  const panelClasses = `
    bg-calc-calc-bg transition-all duration-300 flex flex-col
    ${isMobile 
      ? `fixed right-0 top-0 h-full z-40 w-80 max-w-[85vw] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`
      : 'lg:w-80 lg:static lg:h-full'
    }
  `;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onToggle}
        />
      )}
        {/* History Panel */}
      <div className={panelClasses}>        {/* Header */}
        <div className="bg-calc-display-bg px-4 py-3 border-b border-calc-border flex justify-between items-center shrink-0">
          <h2 className="text-sm font-semibold text-calc-text">
            History
          </h2>
          <div className="flex gap-2">
            {/* Clear History Button */}
            <button 
              className="p-2 rounded hover:bg-calc-btn-hover transition-colors duration-200" 
              onClick={handleClearHistory}
              aria-label="Clear history"
            >
              <TrashIcon />
            </button>
            {/* Close Panel Button (Only on mobile) */}
            {isMobile && (
              <button 
                className="p-2 rounded hover:bg-calc-btn-hover transition-colors duration-200" 
                onClick={onToggle}
                aria-label="Close history panel"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>
          {/* History List - Scrollable with fixed height */}
        <div className="overflow-y-auto flex-1 p-4 min-h-0" style={{ scrollbarWidth: 'thin' }}>
          {completedCalculations.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center text-calc-text-secondary">
              <ClockIcon />
              <p className="text-sm">There's no history yet</p>
            </div>
          ) : (            /* History Items */
            <div className="space-y-2">
              {completedCalculations.map((calc, index) => (
                <div
                  key={calc.id}
                  className={`history-item p-3 rounded-lg cursor-pointer ${
                    index === 0 ? 'history-item-new' : ''
                  }`}
                  onClick={() => handleHistoryItemClick(calc.result)}                >                  <div className="text-xs text-calc-text-secondary mb-1 text-right">
                    {calc.expression}
                  </div>
                  <div className="text-2xl font-light text-calc-text text-right">
                    {calc.result}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

HistoryPanel.displayName = 'HistoryPanel';

export default HistoryPanel;
