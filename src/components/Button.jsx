/**
 * Reusable Calculator Button Component
 */

import { memo } from 'react';

const Button = memo(({ 
  children, 
  onClick, 
  variant = 'number', 
  className = '', 
  ariaLabel,
  disabled = false 
}) => {  const baseClasses = "h-14 rounded-md font-medium text-base transition-all duration-100 user-select-none focus:outline-none active:scale-95";  const variantClasses = {
    number: "bg-calc-btn-default text-calc-text border border-calc-btn-hover hover:bg-calc-btn-hover active:bg-calc-btn-active",
    function: "bg-calc-btn-operator text-calc-text hover:bg-calc-btn-operator-hover active:bg-calc-btn-active",
    operator: "bg-calc-btn-operator text-calc-text hover:bg-calc-btn-operator-hover active:bg-calc-btn-active",
    equals: "bg-calc-btn-equals text-white font-semibold hover:bg-calc-btn-equals-hover active:bg-purple-400"
  };

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = 'scale(0.95)';
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
