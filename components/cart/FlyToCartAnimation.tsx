
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import SupabaseImage from '../shared/SupabaseImage';
import { BUCKETS } from '../../constants';

const FlyToCartAnimation: React.FC = () => {
  const { animationItem, setAnimationItem, setIsCartShaking } = useAppContext();
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animationItem) {
      const cartIcon = document.getElementById('header-cart-icon');
      if (!cartIcon) {
        setAnimationItem(null);
        return;
      }

      const endRect = cartIcon.getBoundingClientRect();
      const { startRect } = animationItem;
      
      // Set initial state before animation
      setStyle({
        position: 'fixed',
        top: `${startRect.top}px`,
        left: `${startRect.left}px`,
        width: `${startRect.width}px`,
        height: `${startRect.height}px`,
        opacity: 1,
        transition: 'all 0.9s cubic-bezier(0.5, 0, 0.95, 0.5)', // Adjusted for a nice arc
        zIndex: 9999,
        borderRadius: '0.5rem',
        overflow: 'hidden',
      });
      setIsAnimating(true);
      
      // Animate to target in the next paint cycle
      const animationTimeout = setTimeout(() => {
        setStyle(prevStyle => ({
          ...prevStyle,
          top: `${endRect.top + endRect.height / 2}px`,
          left: `${endRect.left + endRect.width / 2}px`,
          width: '0px',
          height: '0px',
          opacity: 0.2,
          transform: 'rotate(270deg) scale(0.1)',
          borderRadius: '50%',
        }));
      }, 10);

      // Clean up and trigger cart shake after animation
      const cleanupTimeout = setTimeout(() => {
        setIsCartShaking(true);
        setAnimationItem(null);
        setIsAnimating(false);
        setTimeout(() => setIsCartShaking(false), 600); // Duration of jiggle animation
      }, 900);

      return () => {
        clearTimeout(animationTimeout);
        clearTimeout(cleanupTimeout);
      };
    }
  }, [animationItem, setAnimationItem, setIsCartShaking]);

  if (!isAnimating || !animationItem) {
    return null;
  }

  return (
    <div style={style}>
      <SupabaseImage
        bucket={BUCKETS.PRODUCTS}
        imagePath={animationItem.product.images[0]}
        alt={animationItem.product.name}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default FlyToCartAnimation;
