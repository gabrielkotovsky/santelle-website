'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// Custom smooth scroll function with easing options
export function smoothScrollTo(element: HTMLElement, options: {
  duration?: number;
  easing?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic';
  offset?: number;
  block?: 'start' | 'center' | 'end';
} = {}) {
  const { duration = 1000, easing = 'easeInOutQuad', offset = 0, block = 'start' } = options;
  
  const startPosition = window.pageYOffset;
  const elementRect = element.getBoundingClientRect();
  const elementTop = elementRect.top + window.pageYOffset;
  
  // Calculate target position based on block alignment
  let targetPosition: number;
  if (block === 'center') {
    targetPosition = elementTop - (window.innerHeight / 2) + (elementRect.height / 2) - offset;
  } else if (block === 'end') {
    targetPosition = elementTop - window.innerHeight + elementRect.height - offset;
  } else {
    // 'start' - align to top
    targetPosition = elementTop - offset;
  }
  
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  // Easing functions
  const easingFunctions = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => (--t) * t * t + 1,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  };

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    const easedProgress = easingFunctions[easing](progress);
    const newPosition = startPosition + distance * easedProgress;
    
    window.scrollTo(0, newPosition);
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}