'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Standardized Luxury Back Button Component
 *
 * Supports:
 * - variant="default": In-flow container-aligned for standard content pages
 * - variant="hero": Absolute positioned below navbar, aligned to container for hero sections
 * - custom onClick or custom href
 */
export default function BackButton({
  onClick,
  href,
  variant = 'default',
  ariaLabel = 'Go Back',
  className = '',
  style = {}
}) {
  const router = useRouter();

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    } else if (!href) {
      e.preventDefault();
      router.back();
    }
  };

  const containerClass = variant === 'hero' ? 'shop-hero-back' : 'back-btn-container';

  if (href && !onClick) {
    return (
      <div className={`${containerClass} ${className}`.trim()} style={style}>
        <Link href={href} className="back-btn" aria-label={ariaLabel}>
          <span className="material-icons">arrow_back</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={`${containerClass} ${className}`.trim()} style={style}>
      <button
        type="button"
        onClick={handleClick}
        className="back-btn"
        aria-label={ariaLabel}
      >
        <span className="material-icons">arrow_back</span>
      </button>
    </div>
  );
}
