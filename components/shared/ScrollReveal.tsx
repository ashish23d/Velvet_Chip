import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    animation?: 'reveal' | 'reveal-left' | 'reveal-right' | 'reveal-scale';
    delay?: 0 | 100 | 200 | 300 | 400 | 500;
    threshold?: number;
    once?: boolean;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    className = '',
    animation = 'reveal',
    delay = 0,
    threshold = 0.1,
    once = true
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.unobserve(entry.target);
                } else if (!once) {
                    setIsVisible(false);
                }
            });
        }, { threshold });

        const currentRef = domRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, once]);

    const delayClass = delay > 0 ? `delay-${delay}` : '';
    const animationClass = isVisible ? `${animation} is-visible` : animation;

    return (
        <div
            ref={domRef}
            className={`${animationClass} ${delayClass} ${className}`}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
