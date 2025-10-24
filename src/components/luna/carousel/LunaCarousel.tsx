import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MessageSquare, Menu, Star, Search, ArrowRight, ArrowUp, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CarouselButton } from './CarouselButton';
import { useLunaCarousel } from './useLunaCarousel';
import { CarouselCategory, CarouselConfig } from './types';
import { LunaAvatar } from '../core/LunaAvatar';
import { useLuna } from '../context/LunaContext';
import {
  lunaColors,
  lunaShadows,
  lunaSize,
  lunaSpacing,
  getContainerSize,
} from '../design/DesignTokens';
import {
  entranceAnimations,
  interactionAnimations,
  layoutAnimations,
  dragIndicatorAnimations,
  premiumSprings,
} from '../design/AnimationConfigs';

interface LunaCarouselProps {
  categories: CarouselCategory[];
  config?: Partial<CarouselConfig>;
  className?: string;
}

export const LunaCarousel: React.FC<LunaCarouselProps> = ({
  categories,
  config,
  className,
}) => {
  const { openChat } = useLuna();
  const {
    state,
    config: finalConfig,
    currentItems,
    currentPositions,
    actions,
  } = useLunaCarousel(categories, config);

  const {
    handleItemSelect,
    handleBack,
    handleLongPressStart,
    handleLongPressEnd,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleLunaTap,
    handleCloseChat,
  } = actions;

  // Handle chat open event
  React.useEffect(() => {
    if (state.chatOpen) {
      openChat();
      handleCloseChat();
    }
  }, [state.chatOpen, openChat, handleCloseChat]);

  const containerSize = getContainerSize(finalConfig.radius, finalConfig.buttonSize);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'select-none touch-manipulation', // Prevent text selection and improve touch
        'touch-none', // Prevent default touch behaviors
        'overscroll-none', // Prevent overscroll
        'will-change-transform', // Optimize for animations
        className
      )}
      style={{
        width: containerSize,
        height: containerSize,
      }}
    >
      {/* Background overlay when expanded */}
      <AnimatePresence>
        {state.isExpanded && (
          <motion.div
            className="absolute inset-0 rounded-full bg-black/5 dark:bg-white/5 -z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              width: containerSize,
              height: containerSize,
            }}
          />
        )}
      </AnimatePresence>

      {/* Premium Central Luna Button */}
      <motion.div
        className={cn(
          'absolute z-20 rounded-full border-2',
          'flex items-center justify-center cursor-pointer',
          'transition-all duration-300 ease-out',
          'backdrop-blur-sm will-change-transform',
          // Premium border styling
          state.isLongPressing
            ? 'border-white/60'
            : 'border-white',
        )}
        style={{
          width: lunaSize.center,
          height: lunaSize.center,
          // Perfect mathematical centering
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          // Premium gradient background
          background: `linear-gradient(135deg, ${lunaColors.primary.from} 0%, ${lunaColors.primary.via} 50%, ${lunaColors.primary.to} 100%)`,
          // Premium shadow system
          boxShadow: state.isLongPressing
            ? lunaShadows.elevation.premium.boxShadow
            : lunaShadows.elevation.high.boxShadow,
        }}
        onClick={handleLunaTap}
        // Touch events for mobile
        onTouchStart={(e) => {
          e.preventDefault(); // Prevent scrolling
          const touch = e.touches[0];
          handleLongPressStart();
          handleDragStart(touch.clientX, touch.clientY, true);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          handleDragMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleLongPressEnd();
          handleDragEnd();
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleLongPressEnd();
          handleDragEnd();
        }}
        // Pointer events for desktop
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') {
            handleLongPressStart();
            handleDragStart(e.clientX, e.clientY, false);
          }
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse') {
            handleDragMove(e.clientX, e.clientY);
          }
        }}
        onPointerUp={(e) => {
          if (e.pointerType === 'mouse') {
            handleLongPressEnd();
            handleDragEnd();
          }
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') {
            handleLongPressEnd();
            handleDragEnd();
          }
        }}
        // Premium interactions
        whileHover={{
          ...interactionAnimations.hover,
          boxShadow: lunaShadows.colored.blue,
        }}
        whileTap={interactionAnimations.tap}

        // Enhanced drag feedback with premium springs
        animate={{
          scale: state.isDragging ? 1.1 : state.isLongPressing ? 1.05 : 1,
          rotate: state.isDragging && state.dragDirection ?
            (state.dragDirection === 'right' ? 8 :
             state.dragDirection === 'left' ? -8 : 0) : 0,
        }}
        transition={premiumSprings.responsive}
        // Accessibility
        role="button"
        aria-label={
          state.activeCategory
            ? 'Go back to categories'
            : state.isExpanded
            ? 'Collapse menu'
            : 'Expand menu or long press for chat'
        }
        tabIndex={0}
      >
        <AnimatePresence mode="wait">
          {state.activeCategory ? (
            <motion.div
              key="back"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft size={finalConfig.centerSize * 0.4} className="text-white" />
            </motion.div>
          ) : state.isLongPressing ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare size={finalConfig.centerSize * 0.4} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="luna"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <LunaAvatar size="medium" className="text-white" animated={false} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Long press progress indicator */}
        <AnimatePresence>
          {state.isLongPressing && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white"
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: 1.2,
                opacity: [0, 1, 0],
              }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{
                duration: finalConfig.longPressDuration / 1000,
                ease: 'linear',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Directional Drag Indicators */}
      <AnimatePresence>
        {state.isDragging && state.dragDirection && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {/* Right Indicator - Context Menu */}
            {state.dragDirection === 'right' && (
              <motion.div
                className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg shadow-lg"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <Menu size={20} />
                <span className="text-sm font-medium">Menu</span>
                <ArrowRight size={16} />
              </motion.div>
            )}

            {/* Up Indicator - Favorites */}
            {state.dragDirection === 'up' && (
              <motion.div
                className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <ArrowUp size={16} />
                <Star size={20} />
                <span className="text-sm font-medium">Favorites</span>
              </motion.div>
            )}

            {/* Left Indicator - Search */}
            {state.dragDirection === 'left' && (
              <motion.div
                className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg shadow-lg"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <ArrowLeft size={16} />
                <Search size={20} />
                <span className="text-sm font-medium">Search</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carousel Buttons */}
      <AnimatePresence mode="wait">
        {state.isExpanded && !state.showContextMenu && !state.showFavorites && !state.showSearch && (
          <motion.div
            key={state.activeCategory || 'categories'}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {currentItems.map((item, index) => {
              const position = currentPositions[index];
              if (!position) return null;

              return (
                <CarouselButton
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  position={position}
                  onClick={() => handleItemSelect(item)}
                  size={finalConfig.buttonSize}
                  category={state.activeCategory || undefined}
                  variant="action"
                  showPersistentLabel={true}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu Content */}
      <AnimatePresence>
        {state.showContextMenu && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {[
              { icon: Menu, label: 'Menu', action: () => console.log('Menu') },
              { icon: Search, label: 'Search', action: () => console.log('Search') },
              { icon: Star, label: 'Favorites', action: () => console.log('Favorites') },
              { icon: MessageSquare, label: 'Chat', action: () => openChat() },
            ].map((item, index) => {
              const position = currentPositions[index];
              if (!position) return null;

              return (
                <CarouselButton
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  position={position}
                  onClick={item.action}
                  size={finalConfig.buttonSize}
                  category="capture"
                  variant="secondary"
                  showPersistentLabel={true}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites Content */}
      <AnimatePresence>
        {state.showFavorites && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <Star className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your favorite items will appear here
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Content */}
      <AnimatePresence>
        {state.showSearch && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <Search className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick search across all content
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category indicator */}
      <AnimatePresence>
        {state.activeCategory && (
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 py-1 bg-black/20 dark:bg-white/20 rounded-full backdrop-blur-sm">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {categories.find(cat => cat.id === state.activeCategory)?.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Instructions with Mobile Support */}
      <AnimatePresence>
        {!state.isExpanded && !state.isDragging && (
          <motion.div
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10 max-w-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tap to expand • Long press for chat
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Drag → Menu • ↑ Favorites • ← Search
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Reader Instructions */}
      <div className="sr-only">
        <p>
          Luna carousel interface. Tap to expand categories, long press for chat.
          Use directional drag gestures: right for menu, up for favorites, left for search.
        </p>
      </div>
    </div>
  );
};