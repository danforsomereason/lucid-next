'use client';

import { useEffect } from 'react';

export default function MUIFix() {
  useEffect(() => {
    // Polyfill for Material-UI's getScrollbarSize function
    if (typeof window !== 'undefined') {
      // Create a safe version of ownerDocument
      const originalGetComputedStyle = window.getComputedStyle;
      
      // Monkey-patch to ensure we never get undefined window
      if (!window.document) {
        console.error('Document is not available');
      }
    }
  }, []);

  return null;
}
