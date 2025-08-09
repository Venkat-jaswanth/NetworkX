import { useEffect, useState, useRef } from 'react';

interface ObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (options: ObserverOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    if (!elementRef) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce && observer.current) {
              observer.current.unobserve(entry.target);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.current.observe(elementRef);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [elementRef, threshold, rootMargin, triggerOnce]);

  // THE ONLY CHANGE IS HERE: adding "as const"
  return [setElementRef, isVisible] as const;
};