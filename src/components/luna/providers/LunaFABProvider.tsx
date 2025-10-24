import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { LunaFAB } from '../fab/LunaFAB';
import { LunaCarouselOverlay } from '../fab/LunaCarouselOverlay';

interface LunaFABContextType {
  isOverlayOpen: boolean;
  openOverlay: () => void;
  closeOverlay: () => void;
  toggleOverlay: () => void;
}

export const LunaFABContext = createContext<LunaFABContextType | undefined>(undefined);

interface LunaFABProviderProps {
  children: ReactNode;
  fabSize?: 'small' | 'medium' | 'large';
  fabClassName?: string;
  overlayClassName?: string;
  disabled?: boolean;
}

export const LunaFABProvider: React.FC<LunaFABProviderProps> = ({
  children,
  fabSize = 'medium',
  fabClassName = 'shadow-lg',
  overlayClassName,
  disabled = false
}) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const openOverlay = useCallback(() => {
    if (!disabled) {
      setIsOverlayOpen(true);
    }
  }, [disabled]);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
  }, []);

  const toggleOverlay = useCallback(() => {
    if (isOverlayOpen) {
      closeOverlay();
    } else {
      openOverlay();
    }
  }, [isOverlayOpen, openOverlay, closeOverlay]);

  const contextValue: LunaFABContextType = {
    isOverlayOpen,
    openOverlay,
    closeOverlay,
    toggleOverlay
  };

  return (
    <LunaFABContext.Provider value={contextValue}>
      {children}

      {/* Luna FAB */}
      {!disabled && (
        <LunaFAB
          size={fabSize}
          className={fabClassName}
          showOrbitalButtons={true}
        />
      )}
    </LunaFABContext.Provider>
  );
};


/**
 * Higher-order component for components that need Luna FAB functionality
 */
export const withLunaFAB = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WithLunaFABComponent = (props: P) => (
    <LunaFABProvider>
      <Component {...props} />
    </LunaFABProvider>
  );

  WithLunaFABComponent.displayName = `withLunaFAB(${Component.displayName || Component.name})`;
  return WithLunaFABComponent;
};

/**
 * Standalone Luna FAB component for use without provider context
 * Useful for components that need their own isolated Luna FAB instance
 */
export const StandaloneLunaFAB: React.FC<{
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onCarouselOpen?: () => void;
  onCarouselClose?: () => void;
}> = ({
  size = 'medium',
  className = 'shadow-lg',
  onCarouselOpen,
  onCarouselClose
}) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const handleOpenCarousel = useCallback(() => {
    setIsOverlayOpen(true);
    onCarouselOpen?.();
  }, [onCarouselOpen]);

  const handleCloseCarousel = useCallback(() => {
    setIsOverlayOpen(false);
    onCarouselClose?.();
  }, [onCarouselClose]);

  return (
    <>
      <LunaFAB
        onOpenCarousel={handleOpenCarousel}
        size={size}
        className={className}
      />
      <LunaCarouselOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseCarousel}
      />
    </>
  );
};