import { useState, useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useIntersectionObserver({
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
}: UseIntersectionObserverProps = {}) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // If it should only trigger once and already has, don't observe
        if (triggerOnce && hasTriggered) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
                if (entry.isIntersecting && triggerOnce) {
                    setHasTriggered(true);
                    observer.unobserve(element);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin, triggerOnce, hasTriggered]);

    return { ref, isIntersecting: triggerOnce ? hasTriggered : isIntersecting };
}
