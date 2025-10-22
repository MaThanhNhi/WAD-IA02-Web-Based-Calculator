/**
 * Theme management hook - Dark theme permanently enabled
 */

import { useEffect } from 'react';

export const useTheme = () => {
  useEffect(() => {
    // Permanently apply dark theme to document
    document.documentElement.classList.add('dark');
    console.log('🌙 Dark mode permanently applied');
  }, []);

  // No theme state or toggle functionality needed
  return {};
};
