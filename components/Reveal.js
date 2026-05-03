'use client';

import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, direction = 'up', delay = 0, className = '', style = {} }) {
  const ref = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  // Map direction to original CSS classes
  const revealClass = direction === 'left' ? 'reveal-left' : direction === 'right' ? 'reveal-right' : 'reveal-up';

  return (
    <div
      ref={ref}
      className={`${revealClass} ${isActive ? 'active' : ''} ${className}`}
      style={{ ...style, transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
