import { useEffect, useState, useRef, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  skip?: boolean;
}

interface UseIntersectionObserverReturn {
  isVisible: boolean;
  entry: IntersectionObserverEntry | null;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  elementRef: RefObject<T>,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    threshold = 0,
    rootMargin = '0px',
    triggerOnce = false,
    skip = false,
    ...observerOptions
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (skip || !elementRef.current) {
      return;
    }

    // If triggerOnce and already triggered, don't observe again
    if (triggerOnce && hasTriggered.current) {
      return;
    }

    const element = elementRef.current;

    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [observerEntry] = entries;
        const isIntersecting = observerEntry.isIntersecting;

        setEntry(observerEntry);
        setIsVisible(isIntersecting);

        if (isIntersecting && triggerOnce) {
          hasTriggered.current = true;
          // Disconnect observer after first trigger
          observerRef.current?.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
        ...observerOptions,
      }
    );

    // Start observing
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      observerRef.current?.disconnect();
    };
  }, [
    elementRef,
    threshold,
    rootMargin,
    triggerOnce,
    skip,
    observerOptions.root,
  ]);

  // Reset when skip changes from true to false
  useEffect(() => {
    if (!skip) {
      hasTriggered.current = false;
      setIsVisible(false);
      setEntry(null);
    }
  }, [skip]);

  return { isVisible, entry };
}

// Hook for observing multiple elements
export function useIntersectionObserverMultiple<T extends HTMLElement = HTMLDivElement>(
  elementRefs: RefObject<T>[],
  options: UseIntersectionObserverOptions = {}
): Record<string, UseIntersectionObserverReturn> {
  const {
    threshold = 0,
    rootMargin = '0px',
    triggerOnce = false,
    skip = false,
    ...observerOptions
  } = options;

  const [visibilityMap, setVisibilityMap] = useState<Record<string, UseIntersectionObserverReturn>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggeredElements = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (skip || elementRefs.length === 0) {
      return;
    }

    // Filter out null refs and already triggered elements (if triggerOnce)
    const validElements = elementRefs
      .map((ref, index) => ({ element: ref.current, index: index.toString() }))
      .filter(({ element, index }) => {
        return element && (!triggerOnce || !triggeredElements.current.has(index));
      });

    if (validElements.length === 0) {
      return;
    }

    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const updates: Record<string, UseIntersectionObserverReturn> = {};

        entries.forEach((entry) => {
          const elementIndex = validElements.findIndex(
            ({ element }) => element === entry.target
          );

          if (elementIndex !== -1) {
            const index = validElements[elementIndex].index;
            const isIntersecting = entry.isIntersecting;

            updates[index] = {
              isVisible: isIntersecting,
              entry,
            };

            if (isIntersecting && triggerOnce) {
              triggeredElements.current.add(index);
            }
          }
        });

        if (Object.keys(updates).length > 0) {
          setVisibilityMap((prev) => ({ ...prev, ...updates }));
        }
      },
      {
        threshold,
        rootMargin,
        ...observerOptions,
      }
    );

    // Start observing all valid elements
    validElements.forEach(({ element }) => {
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    // Cleanup
    return () => {
      observerRef.current?.disconnect();
    };
  }, [elementRefs, threshold, rootMargin, triggerOnce, skip]);

  // Reset when skip changes from true to false
  useEffect(() => {
    if (!skip) {
      triggeredElements.current.clear();
      setVisibilityMap({});
    }
  }, [skip]);

  return visibilityMap;
}

// Hook for lazy loading with intersection observer
export function useLazyLoading<T extends HTMLElement = HTMLDivElement>(
  elementRef: RefObject<T>,
  options: UseIntersectionObserverOptions & {
    onVisible?: () => void;
    onHidden?: () => void;
  } = {}
) {
  const { onVisible, onHidden, ...observerOptions } = options;
  const { isVisible, entry } = useIntersectionObserver(elementRef, observerOptions);
  const hasBeenVisible = useRef(false);

  useEffect(() => {
    if (isVisible && !hasBeenVisible.current) {
      hasBeenVisible.current = true;
      onVisible?.();
    } else if (!isVisible && hasBeenVisible.current) {
      onHidden?.();
    }
  }, [isVisible, onVisible, onHidden]);

  return {
    isVisible,
    hasBeenVisible: hasBeenVisible.current,
    entry,
  };
}

// Hook for tracking viewport visibility percentage
export function useViewportVisibility<T extends HTMLElement = HTMLDivElement>(
  elementRef: RefObject<T>,
  options: UseIntersectionObserverOptions = {}
) {
  const [visibilityRatio, setVisibilityRatio] = useState(0);
  const { entry } = useIntersectionObserver(elementRef, {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    ...options,
  });

  useEffect(() => {
    if (entry) {
      setVisibilityRatio(entry.intersectionRatio);
    }
  }, [entry]);

  return {
    visibilityRatio,
    isFullyVisible: visibilityRatio === 1,
    isPartiallyVisible: visibilityRatio > 0,
    entry,
  };
}