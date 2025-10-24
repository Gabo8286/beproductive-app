/**
 * Enhanced Luna Orbital Buttons
 * Next-generation orbital navigation system with intelligent context awareness,
 * progressive disclosure, and advanced interaction patterns
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LucideIcon, MoreHorizontal, ChevronDown, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useEnhancedNavigationContext } from '@/hooks/useEnhancedNavigationContext';
import { useScreenReader } from '@/hooks/useScreenReader';
import { useSmartNavigationSuggestions } from '@/hooks/useSmartNavigationSuggestions';
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel';
import { NavigationAnalyticsDashboard } from '../analytics/NavigationAnalyticsDashboard';
import { useRealTimeAnalytics } from '@/hooks/useNavigationAnalytics';
import { usePredictiveNavigation } from '@/hooks/usePredictiveNavigation';
import { navigationHubRegistry } from '@/services/NavigationHubRegistry';
import {
  NavigationHub,
  NavigationHubId,
  SubNavigationItem,
  QuickAction,
  InteractionPattern,
  DisclosureLevel,
} from '@/types/navigation';

interface EnhancedLunaOrbitalButtonsProps {
  isVisible: boolean;
  centerX: number;
  centerY: number;
  radius?: number;
  onClose: () => void;
  className?: string;
  enableAdvancedFeatures?: boolean;
}

interface GestureState {
  isRotating: boolean;
  isPinching: boolean;
  initialDistance: number;
  initialRadius: number;
  touches: Touch[];
}

interface OrbitalButtonState {
  hub: NavigationHub;
  position: { x: number; y: number };
  isExpanded: boolean;
  animationDelay: number;
}

export const EnhancedLunaOrbitalButtons: React.FC<EnhancedLunaOrbitalButtonsProps> = ({
  isVisible,
  centerX,
  centerY,
  radius = 80,
  onClose,
  className,
  enableAdvancedFeatures = true,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const navigate = useNavigate();
  const { context, updateWorkflowState } = useEnhancedNavigationContext();
  const { announce, announceNavigation, announceExpansion, announceGesture } = useScreenReader();
  const { suggestions: smartSuggestions, recordNavigation, preloadHubs } = useSmartNavigationSuggestions();
  const { isPreloaded, generatePredictions, queueStatus, metrics: preloadMetrics } = usePredictiveNavigation();

  // Component state
  const [rotationOffset, setRotationOffset] = useState(0);
  const [expandedHub, setExpandedHub] = useState<NavigationHubId | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const [dragStartRotation, setDragStartRotation] = useState(0);
  const [lastInteraction, setLastInteraction] = useState<Date>(new Date());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentRadius, setCurrentRadius] = useState(radius);
  const [gestureState, setGestureState] = useState<GestureState>({
    isRotating: false,
    isPinching: false,
    initialDistance: 0,
    initialRadius: radius,
    touches: []
  });
  const [focusedHubIndex, setFocusedHubIndex] = useState<number>(0);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Analytics tracking
  const { trackHubClick, trackQuickAction, trackGesture, trackKeyboardShortcut } = useRealTimeAnalytics();

  // Update navigation registry context and generate predictions
  useEffect(() => {
    navigationHubRegistry.updateContext(context);

    // Generate predictive navigation suggestions
    if (enableAdvancedFeatures) {
      generatePredictions();
    }
  }, [context, enableAdvancedFeatures, generatePredictions]);

  // Get active hubs based on current context
  const activeHubs = useMemo(() => {
    return navigationHubRegistry.getActiveHubs();
  }, [context]);

  // Get progressive disclosure configuration
  const disclosureConfig = useMemo(() => {
    return navigationHubRegistry.getDisclosureConfig();
  }, [context]);

  // Calculate button positions in orbital arrangement
  const orbitalButtons: OrbitalButtonState[] = useMemo(() => {
    const visibleHubs = activeHubs.slice(0, disclosureConfig.maxVisibleItems);
    const angleStep = (2 * Math.PI) / visibleHubs.length;
    const effectiveRadius = Math.max(40, Math.min(120, currentRadius)); // Constrain radius

    return visibleHubs.map((hub, index) => {
      const angle = (index * angleStep - Math.PI / 2) + (rotationOffset * Math.PI / 180);
      const x = Math.cos(angle) * effectiveRadius;
      const y = Math.sin(angle) * effectiveRadius;

      return {
        hub,
        position: { x, y },
        isExpanded: expandedHub === hub.id,
        animationDelay: index * 0.1,
      };
    });
  }, [activeHubs, rotationOffset, currentRadius, expandedHub, disclosureConfig.maxVisibleItems]);

  // Handle hub interaction with accessibility announcements
  const handleHubInteraction = useCallback((
    hub: NavigationHub,
    pattern: InteractionPattern
  ) => {
    setLastInteraction(new Date());
    triggerHaptic('medium');

    switch (pattern) {
      case 'tap':
        // Quick navigation to hub's primary path
        announceNavigation(hub.name, 'Navigating to');
        recordNavigation(hub.id); // Record behavior for learning
        trackHubClick(hub.id, 'tap'); // Track analytics
        navigate(hub.path);
        onClose();
        break;

      case 'long-press':
        // Expand hub to show sub-navigation
        if (expandedHub === hub.id) {
          setExpandedHub(null);
          navigationHubRegistry.collapseHub();
          announceExpansion(hub.name, false);
          trackHubClick(hub.id, 'long-press-collapse');
        } else {
          setExpandedHub(hub.id);
          navigationHubRegistry.expandHub(hub.id);
          announceExpansion(hub.name, true);
          trackHubClick(hub.id, 'long-press-expand');
        }
        break;

      case 'double-tap':
        // Execute contextual quick action
        const quickActions = navigationHubRegistry.getContextualQuickActions(hub.id);
        if (quickActions.length > 0) {
          announceNavigation(quickActions[0].label, 'Executing quick action');
          trackQuickAction(hub.id, quickActions[0].id);
          quickActions[0].action();
          onClose();
        }
        break;

      default:
        break;
    }
  }, [expandedHub, navigate, onClose, triggerHaptic, announceNavigation, announceExpansion]);

  // Handle sub-navigation item click with announcements
  const handleSubNavigationClick = useCallback((item: SubNavigationItem) => {
    triggerHaptic('light');
    announceNavigation(item.label, 'Navigating to sub-item');
    trackHubClick(expandedHub!, `sub-nav-${item.id}`);
    navigate(item.path);
    onClose();
  }, [navigate, onClose, triggerHaptic, announceNavigation, expandedHub, trackHubClick]);

  // Handle quick action with announcements
  const handleQuickAction = useCallback((action: QuickAction) => {
    triggerHaptic('medium');
    announceNavigation(action.label, 'Executing quick action');
    trackQuickAction(expandedHub!, action.id);
    action.action();
    onClose();
  }, [onClose, triggerHaptic, announceNavigation, expandedHub, trackQuickAction]);

  // Enhanced gesture handlers
  const handleRotationStart = useCallback((clientX: number, clientY: number) => {
    const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

    if (distance >= currentRadius * 0.7 && distance <= currentRadius * 1.4) {
      setIsDragging(true);
      setGestureState(prev => ({ ...prev, isRotating: true }));
      const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      setDragStartAngle(angle);
      setDragStartRotation(rotationOffset);
      triggerHaptic('light');
      return true;
    }
    return false;
  }, [centerX, centerY, currentRadius, rotationOffset, triggerHaptic]);

  // Pinch gesture handlers
  const handlePinchStart = useCallback((touches: TouchList) => {
    if (touches.length === 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      setGestureState(prev => ({
        ...prev,
        isPinching: true,
        initialDistance: distance,
        initialRadius: currentRadius,
        touches: Array.from(touches)
      }));

      trackGesture('capture', 'pinch-start'); // Track gesture start
      triggerHaptic('medium');
      return true;
    }
    return false;
  }, [currentRadius, triggerHaptic, trackGesture]);

  const handlePinchMove = useCallback((touches: TouchList) => {
    if (!gestureState.isPinching || touches.length !== 2) return;

    const touch1 = touches[0];
    const touch2 = touches[1];
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    const scale = currentDistance / gestureState.initialDistance;
    const newRadius = Math.max(40, Math.min(120, gestureState.initialRadius * scale));

    // Only announce significant changes to avoid spam
    const radiusDiff = Math.abs(newRadius - currentRadius);
    if (radiusDiff > 5) {
      const scalePercent = Math.round((newRadius / radius) * 100);
      announceGesture('Pinch', `Orbital size ${scalePercent}%`);
    }

    setCurrentRadius(newRadius);
  }, [gestureState, currentRadius, radius, announceGesture]);

  const handlePinchEnd = useCallback(() => {
    if (gestureState.isPinching) {
      setGestureState(prev => ({
        ...prev,
        isPinching: false,
        touches: []
      }));
      trackGesture('capture', 'pinch-end', true);
      triggerHaptic('medium');
    }
  }, [gestureState.isPinching, triggerHaptic, trackGesture]);

  const handleRotationMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    let angleDiff = currentAngle - dragStartAngle;

    // Normalize angle difference
    while (angleDiff > 180) angleDiff -= 360;
    while (angleDiff < -180) angleDiff += 360;

    const newRotation = (dragStartRotation + angleDiff) % 360;
    setRotationOffset(newRotation);
  }, [isDragging, centerX, centerY, dragStartAngle, dragStartRotation]);

  const handleRotationEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setGestureState(prev => ({ ...prev, isRotating: false }));
      trackGesture('capture', 'rotation-end', true);
      triggerHaptic('medium');
    }
  }, [isDragging, triggerHaptic, trackGesture]);

  // Enhanced keyboard shortcuts and focus management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      // Set keyboard navigation flag
      setIsKeyboardNavigation(true);
      setLastInteraction(new Date());

      switch (e.key) {
        case 'Escape':
          if (expandedHub) {
            setExpandedHub(null);
            navigationHubRegistry.collapseHub();
          } else {
            onClose();
          }
          break;

        case 'Tab':
          e.preventDefault();
          const direction = e.shiftKey ? 'previous' : 'next';
          if (e.shiftKey) {
            setFocusedHubIndex(prev => {
              const newIndex = prev <= 0 ? orbitalButtons.length - 1 : prev - 1;
              if (orbitalButtons[newIndex]) {
                announce(`Focused ${orbitalButtons[newIndex].hub.name}`, { priority: 'polite' });
              }
              return newIndex;
            });
          } else {
            setFocusedHubIndex(prev => {
              const newIndex = prev >= orbitalButtons.length - 1 ? 0 : prev + 1;
              if (orbitalButtons[newIndex]) {
                announce(`Focused ${orbitalButtons[newIndex].hub.name}`, { priority: 'polite' });
              }
              return newIndex;
            });
          }
          triggerHaptic('light');
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (orbitalButtons[focusedHubIndex]) {
            const hub = orbitalButtons[focusedHubIndex].hub;
            const action = e.key === 'Enter' ? 'tap' : 'long-press';
            trackKeyboardShortcut(hub.id, e.key);
            handleHubInteraction(hub, action);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          setRotationOffset(prev => prev - 30);
          announceGesture('Arrow key', 'Rotated left');
          trackKeyboardShortcut('capture', 'ArrowLeft');
          triggerHaptic('light');
          break;

        case 'ArrowRight':
          e.preventDefault();
          setRotationOffset(prev => prev + 30);
          announceGesture('Arrow key', 'Rotated right');
          trackKeyboardShortcut('capture', 'ArrowRight');
          triggerHaptic('light');
          break;

        case 'ArrowUp':
          e.preventDefault();
          setCurrentRadius(prev => {
            const newRadius = Math.min(120, prev + 10);
            announceGesture('Arrow key', `Increased size to ${Math.round((newRadius / radius) * 100)}%`);
            return newRadius;
          });
          triggerHaptic('light');
          break;

        case 'ArrowDown':
          e.preventDefault();
          setCurrentRadius(prev => {
            const newRadius = Math.max(40, prev - 10);
            announceGesture('Arrow key', `Decreased size to ${Math.round((newRadius / radius) * 100)}%`);
            return newRadius;
          });
          triggerHaptic('light');
          break;

        case '=':
        case '+':
          e.preventDefault();
          setCurrentRadius(prev => Math.min(120, prev + 15));
          triggerHaptic('medium');
          break;

        case '-':
          e.preventDefault();
          setCurrentRadius(prev => Math.max(40, prev - 15));
          triggerHaptic('medium');
          break;

        default:
          // Hub quick access with number keys
          if (e.key >= '1' && e.key <= '6') {
            const index = parseInt(e.key) - 1;
            if (orbitalButtons[index]) {
              setFocusedHubIndex(index);
              announce(`Shortcut ${e.key}: ${orbitalButtons[index].hub.name}`, { priority: 'polite' });
              handleHubInteraction(orbitalButtons[index].hub, 'tap');
            }
          }
          break;
      }
    };

    const handleKeyUp = () => {
      // Reset keyboard navigation flag after a delay
      setTimeout(() => setIsKeyboardNavigation(false), 100);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isVisible, onClose, orbitalButtons, focusedHubIndex, expandedHub, handleHubInteraction, triggerHaptic, announce, announceGesture, radius]);

  // Auto-collapse expanded hubs after inactivity with announcement
  useEffect(() => {
    if (!expandedHub) return;

    const timeout = setTimeout(() => {
      const expandedHubData = orbitalButtons.find(b => b.hub.id === expandedHub);
      if (expandedHubData) {
        announce(`${expandedHubData.hub.name} auto-collapsed due to inactivity`, { priority: 'polite' });
      }
      setExpandedHub(null);
      navigationHubRegistry.collapseHub();
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, [expandedHub, lastInteraction, orbitalButtons, announce]);

  // Render hub button
  const renderHubButton = useCallback((buttonState: OrbitalButtonState, index: number) => {
    const { hub, position, isExpanded, animationDelay } = buttonState;
    const Icon = hub.icon;
    const isActive = context.currentHub === hub.id;
    const isFocused = isKeyboardNavigation && focusedHubIndex === index;
    const buttonSize = Math.max(32, Math.min(56, currentRadius * 0.6)); // Scale with radius

    return (
      <motion.div
        key={hub.id}
        className={cn(
          'absolute rounded-full shadow-lg border-2 border-white',
          'flex items-center justify-center cursor-pointer',
          'transition-all duration-200 ease-out',
          hub.color,
          isActive && 'ring-2 ring-white ring-opacity-50',
          isFocused && 'ring-4 ring-blue-400 ring-opacity-75',
          'hover:scale-110 active:scale-95',
          'touch-manipulation select-none focus:outline-none',
          'focus-visible:ring-4 focus-visible:ring-blue-400'
        )}
        style={{
          width: buttonSize,
          height: buttonSize,
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{
          scale: 0,
          opacity: 0,
          rotate: -180,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          rotate: 0,
        }}
        exit={{
          scale: 0,
          opacity: 0,
          rotate: 180,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          delay: animationDelay,
        }}
        onClick={() => handleHubInteraction(hub, 'tap')}
        onDoubleClick={() => handleHubInteraction(hub, 'double-tap')}
        onContextMenu={(e) => {
          e.preventDefault();
          handleHubInteraction(hub, 'long-press');
        }}
        whileHover={{
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
          scale: 1.1,
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.1 },
        }}
        tabIndex={isKeyboardNavigation ? (isFocused ? 0 : -1) : -1}
        role="button"
        aria-label={`${hub.name} - ${hub.description}. ${isActive ? 'Currently active. ' : ''}${isExpanded ? 'Expanded with sub-options. ' : ''}Press Enter to navigate, Space for options.`}
        aria-pressed={isExpanded}
        aria-current={isActive ? 'page' : undefined}
        title={`${hub.name} (${hub.description})`}
      >
        <Icon size={Math.max(14, Math.min(20, buttonSize * 0.4))} className="text-white" />

        {/* Keyboard focus indicator */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationDelay + 0.2 }}
          />
        )}

        {/* Notification badge */}
        {hub.id === 'engage-collaboration' && context.unreadNotifications > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationDelay + 0.3 }}
          >
            {context.unreadNotifications > 9 ? '9+' : context.unreadNotifications}
          </motion.div>
        )}

        {/* Smart suggestion indicator */}
        {smartSuggestions.some(s => s.hubId === hub.id) && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-400 rounded-full border border-white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animationDelay + 0.4 }}
            title="AI suggests this hub for current context"
          >
            <motion.div
              className="absolute inset-0 bg-purple-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        )}

        {/* Preloaded indicator */}
        {enableAdvancedFeatures && isPreloaded(hub.path) && (
          <motion.div
            className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full border border-white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animationDelay + 0.5 }}
            title="Hub resources are preloaded for fast navigation"
          >
            <motion.div
              className="absolute inset-0 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}

        {/* Expansion indicator */}
        {isExpanded && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white border-dashed animate-pulse"
            initial={{ scale: 1 }}
            animate={{ scale: 1.3 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          />
        )}
      </motion.div>
    );
  }, [context, handleHubInteraction, isKeyboardNavigation, focusedHubIndex, currentRadius, announce]);

  // Render sub-navigation for expanded hub with enhanced animations
  const renderSubNavigation = useCallback((hub: NavigationHub) => {
    const subItems = navigationHubRegistry.getRelevantSubNavigation(hub.id);
    const quickActions = navigationHubRegistry.getContextualQuickActions(hub.id);

    if (subItems.length === 0 && quickActions.length === 0) return null;

    const subRadius = currentRadius + Math.max(40, currentRadius * 0.75); // Dynamic sub-radius
    const itemCount = Math.min(subItems.length + quickActions.length, 6); // Limit items
    const angleStep = (Math.PI * 1.2) / Math.max(itemCount - 1, 1); // 216 degree arc for better distribution
    const startAngle = -Math.PI * 0.6; // Start 108 degrees up

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          duration: 0.4
        }}
        className="absolute inset-0"
      >
        {/* Sub-navigation items with enhanced animations */}
        {subItems.slice(0, Math.min(4, 6 - quickActions.length)).map((item, index) => {
          const angle = startAngle + (index * angleStep);
          const x = Math.cos(angle) * subRadius;
          const y = Math.sin(angle) * subRadius;
          const ItemIcon = item.icon;

          const itemSize = Math.max(24, Math.min(40, currentRadius * 0.4));

          return (
            <motion.div
              key={item.id}
              className={cn(
                'absolute rounded-full shadow-lg border border-white/30',
                'flex items-center justify-center cursor-pointer',
                'bg-gray-800/95 backdrop-blur-md text-white',
                'hover:scale-125 hover:bg-gray-700/95 transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400'
              )}
              style={{
                width: itemSize,
                height: itemSize,
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{
                scale: 0,
                opacity: 0,
                rotate: -180,
                x: x * 0.3,
                y: y * 0.3
              }}
              animate={{
                scale: 1,
                opacity: 1,
                rotate: 0,
                x: x,
                y: y
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: index * 0.1
              }}
              onClick={() => handleSubNavigationClick(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSubNavigationClick(item);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Sub-navigation: ${item.label}${item.badge ? ` (${item.badge} notifications)` : ''}`}
              title={item.label}
            >
              <ItemIcon size={Math.max(10, Math.min(16, itemSize * 0.4))} />

              {/* Badge for notifications */}
              {item.badge && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {item.badge}
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* Quick actions */}
        {quickActions.slice(0, 2).map((action, index) => {
          const actionIndex = subItems.length + index;
          const angle = startAngle + (actionIndex * angleStep);
          const x = Math.cos(angle) * subRadius;
          const y = Math.sin(angle) * subRadius;
          const ActionIcon = action.icon;

          return (
            <motion.div
              key={action.id}
              className={cn(
                'absolute w-8 h-8 rounded-full shadow-md border border-white/20',
                'flex items-center justify-center cursor-pointer',
                action.color,
                'hover:scale-110 transition-all duration-200'
              )}
              style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: actionIndex * 0.05 }}
              onClick={() => handleQuickAction(action)}
              title={action.label}
            >
              <ActionIcon size={12} className="text-white" />
            </motion.div>
          );
        })}
      </motion.div>
    );
  }, [currentRadius, handleSubNavigationClick, handleQuickAction, announce]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with rotation gesture support */}
          <motion.div
            className={cn(
              'fixed inset-0 bg-black/20 backdrop-blur-sm z-40',
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              if (!isDragging && !expandedHub) {
                onClose();
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleRotationStart(e.clientX, e.clientY);
            }}
            onMouseMove={(e) => {
              handleRotationMove(e.clientX, e.clientY);
            }}
            onMouseUp={handleRotationEnd}
            onMouseLeave={handleRotationEnd}
            onTouchStart={(e) => {
              e.preventDefault();

              if (e.touches.length === 2) {
                // Two-finger pinch gesture
                handlePinchStart(e.touches);
              } else if (e.touches.length === 1) {
                // Single-finger rotation gesture
                const touch = e.touches[0];
                handleRotationStart(touch.clientX, touch.clientY);
              }
            }}
            onTouchMove={(e) => {
              e.preventDefault();

              if (gestureState.isPinching && e.touches.length === 2) {
                handlePinchMove(e.touches);
              } else if (gestureState.isRotating && e.touches.length === 1) {
                const touch = e.touches[0];
                handleRotationMove(touch.clientX, touch.clientY);
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault();

              if (gestureState.isPinching) {
                handlePinchEnd();
              }
              if (gestureState.isRotating) {
                handleRotationEnd();
              }
            }}
            style={{ touchAction: 'none' }}
          />

          {/* Main orbital buttons container */}
          <div
            className={cn('fixed z-[60] pointer-events-none', className)}
            style={{
              left: centerX,
              top: centerY,
              transform: 'translate(-50%, -50%)',
            }}
            role="navigation"
            aria-label="Luna Orbital Navigation - Interactive hub navigation system"
            aria-describedby="luna-nav-instructions"
          >
            {/* Orbital buttons */}
            {orbitalButtons.map((buttonState, index) => renderHubButton(buttonState, index))}

            {/* Sub-navigation for expanded hub */}
            <AnimatePresence>
              {expandedHub && (
                <>
                  {orbitalButtons
                    .filter(button => button.hub.id === expandedHub)
                    .map(button => renderSubNavigation(button.hub))}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Gesture indicators */}
          {(gestureState.isRotating || gestureState.isPinching) && (
            <motion.div
              className="fixed z-[55] pointer-events-none"
              style={{
                left: centerX,
                top: centerY,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div
                className={cn(
                  'rounded-full border-2 border-dashed animate-pulse',
                  gestureState.isRotating ? 'border-blue-400/60' : 'border-purple-400/60'
                )}
                style={{
                  width: currentRadius * 2,
                  height: currentRadius * 2,
                }}
              />
              {gestureState.isPinching && (
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-medium bg-black/70 px-2 py-1 rounded"
                >
                  {Math.round(currentRadius)}px
                </div>
              )}
            </motion.div>
          )}

          {/* Instructions overlay with accessibility */}
          <motion.div
            id="luna-nav-instructions"
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[65] pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            role="status"
            aria-live="polite"
          >
            <div className="bg-black/80 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap">
              {gestureState.isRotating ? (
                'Drag to rotate • Release to select'
              ) : gestureState.isPinching ? (
                'Pinch to zoom • Release to set size'
              ) : expandedHub ? (
                isKeyboardNavigation ? 'Tab to navigate • Enter to select • Space for options' : 'Tap sub-items • Click outside to close'
              ) : (
                isKeyboardNavigation ? 'Tab/Numbers to select • Enter to navigate • Space for options • Arrow keys to adjust' : 'Tap hub • Hold for options • Drag to rotate • Pinch to zoom'
              )}

              {/* Preload status */}
              {enableAdvancedFeatures && (queueStatus.loading > 0 || queueStatus.completed > 0) && (
                <div className="text-xs text-blue-300 mt-1">
                  Smart preloading: {queueStatus.completed} ready • {queueStatus.loading} loading
                </div>
              )}
            </div>
          </motion.div>

          {/* AI suggestions indicator with accessibility */}
          {enableAdvancedFeatures && (
            <motion.div
              className="fixed top-20 right-4 z-[65] pointer-events-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="relative">
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                  onClick={() => {
                    const newState = !showSuggestions;
                    setShowSuggestions(newState);
                    announce(newState ? 'AI suggestions panel opened' : 'AI suggestions panel closed', { priority: 'polite' });
                    trackHubClick('insights', newState ? 'ai-suggestions-open' : 'ai-suggestions-close');
                  }}
                  aria-label="Toggle AI Suggestions Panel"
                  aria-pressed={showSuggestions}
                  title="AI Suggestions - Context-aware navigation recommendations"
                >
                  <Sparkles size={16} aria-hidden="true" />
                </button>

                {/* Suggestion count badge */}
                {smartSuggestions.length > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {smartSuggestions.length > 9 ? '9+' : smartSuggestions.length}
                  </motion.div>
                )}

                {/* Pulse indicator for high-priority suggestions */}
                {smartSuggestions.some(s => s.priority === 'high' || s.priority === 'urgent') && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-purple-400 border-opacity-50"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Preload activity indicator */}
                {enableAdvancedFeatures && queueStatus.loading > 0 && (
                  <motion.div
                    className="absolute top-8 right-0 w-2 h-2 bg-blue-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    title={`Preloading ${queueStatus.loading} resources`}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Analytics Dashboard Button */}
          {enableAdvancedFeatures && (
            <motion.div
              className="fixed top-20 left-4 z-[65] pointer-events-auto"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                onClick={() => {
                  setShowAnalytics(true);
                  trackHubClick('admin', 'analytics-dashboard-open');
                }}
                aria-label="Open Analytics Dashboard"
                title="Analytics Dashboard - Navigation performance insights"
              >
                <TrendingUp size={16} aria-hidden="true" />
              </button>
            </motion.div>
          )}

          {/* Smart Suggestions Panel */}
          <SmartSuggestionsPanel
            isVisible={showSuggestions}
            onClose={() => setShowSuggestions(false)}
          />

          {/* Analytics Dashboard */}
          <NavigationAnalyticsDashboard
            isOpen={showAnalytics}
            onClose={() => {
              setShowAnalytics(false);
              trackHubClick('admin', 'analytics-dashboard-close');
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};