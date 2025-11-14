import React from 'react';

/**
 * Check if the current viewport is mobile
 * Uses the standard mobile breakpoint of 768px (Tailwind md breakpoint)
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Hook-like function to get mobile state and listen for changes
 */
export const useIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;

  const [isMobileState, setIsMobileState] = React.useState<boolean>(isMobile());

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileState(isMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobileState;
};

/**
 * Get viewport breakpoint name
 */
export const getBreakpoint = (): 'sm' | 'md' | 'lg' | 'xl' | '2xl' => {
  if (typeof window === 'undefined') return 'md';
  
  const width = window.innerWidth;
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return '2xl';
};
